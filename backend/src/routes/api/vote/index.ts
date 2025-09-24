import type { FastifyRequest } from "fastify";
import * as errors from "http-errors";
import { Type } from "@fastify/type-provider-typebox";

import log from "../../../log.js";
import * as notification from "../../../notification.js";
import * as db from "../../../db/index.js";
import type { ServerInstance } from "../../../server.js";
import { ok } from "../../../api-helper.js";

import * as spatial from "../../../spatial.js";
import assertUser from "../../../types/assertUser.js";
import { type UserId, UserIdType } from "../../../shared/typebox.js";
import * as userService from "../../../service/user.js";

export default async function routes(server: ServerInstance) {
	// biome-ignore lint/suspicious/noExplicitAny: types of source package are wrong
	server.addHook("onRequest", server.csrfProtection as any);
	server.addHook(
		"preHandler",
		server.auth([server.requiresAuth, server.requiresProfile], {
			relation: "and",
		}),
	);

	server.get("/", async (req, res) => {
		assertUser(req);
		const votes = await db.vote.findOfUser(req.user.id, 50);
		res.send(ok(votes));
	});

	server.put(
		"/",
		{
			schema: {
				body: Type.Object({
					partnerId: UserIdType,
					vote: Type.Boolean(),
				}),
			},
		},
		async (req, res) => {
			assertUser(req);
			const partnerId = req.body.partnerId as UserId;
			const vote = req.body.vote;

			// No transactions here.
			// This is not very important and we don't want business logic in the DB layer.
			// We should use a proper pattern, but this entire application is a hack, so nope

			await db.vote.setVote(req.user.id, partnerId, vote);
			log.info(`${req.user.display_name} voted "${vote ? "yes" : "no"}" to ${partnerId}`);

			const match = await checkForMatchAfterVoteOrVoteChange(req, partnerId);
			res.send(ok(match ?? null));
		},
	);

	server.patch(
		"/",
		{
			schema: {
				body: Type.Object({
					partnerId: UserIdType,
					newDecision: Type.Boolean(),
				}),
			},
		},
		async (req, res) => {
			assertUser(req);
			const partnerId = req.body.partnerId as UserId;
			const newDecision = req.body.newDecision;

			if (!newDecision) {
				// Currently, we only allow revocation of downvotes (so newDecision == true)

				// If we allow the removal of upvoted people, we must also do this:
				// - Remove the notifications in the queue (if present)
				// - Remove notifications in the user_notification table
				// - What to do if they are already sent?
				throw new errors.BadRequest();
			}

			// No transactions here.
			// This is not very important and we don't want business logic in the DB layer.
			// We should use a proper pattern, but this entire application is a hack, so nope

			await db.vote.changeVote(req.user.id, partnerId, newDecision);
			log.info(
				`${req.user.display_name} changed their mind about ${partnerId} to "${
					newDecision ? "yes" : "no"
				}"`,
			);

			const match = await checkForMatchAfterVoteOrVoteChange(req, partnerId);
			res.send(ok(match ?? null));
		},
	);

	server.get("/match", async (req, res) => {
		assertUser(req);

		const matches = await db.match.findAllOfUser(req.user.id);
		res.send(ok(matches));
	});

	server.get("/pending", async (req, res) => {
		assertUser(req);

		const votes = await db.vote.findPendingVotesOfUser(req.user, /* maxVotesPerDay */ 1000);

		const userLocation = await db.user.getGeoLocation(req.user);
		const candidates = votes.map(v => ({
			...v,
			location: undefined, // Override location, so we don't leak it to the client
			distance: getDistance(userLocation, v.location),
		}));

		res.send(ok(candidates));
	});
}

function getDistance(
	userLocation: spatial.GeoPoint | undefined,
	candidateLocation: spatial.GeoPoint | undefined,
) {
	// If the user has not given us his location, we cannot display some distance measure
	// Same if the candidate has no location set
	if (!userLocation || !candidateLocation) return undefined;

	const distanceInKm = spatial.getDistanceBetween(userLocation, candidateLocation);

	// These wordings might change in the future, depending on the user density
	if (distanceInKm <= 1) return "direkt bei dir";
	if (distanceInKm <= 5) return "ganz nah";
	if (distanceInKm <= 25) return "nah";
	if (distanceInKm <= 80) return "in der Gegend";
	if (distanceInKm <= 200) return "ein bisschen entfernt";
	if (distanceInKm <= 300) return "weit weg";
	if (distanceInKm <= 500) return "ganz weit weg";
	if (distanceInKm <= 600) return "ultra weit weg";
	return "quasi am anderen Ende der Welt";
}

async function checkForMatchAfterVoteOrVoteChange(req: FastifyRequest, partnerId: UserId) {
	assertUser(req);

	const match = await db.match.isMatchByVote(req.user.id, partnerId);
	if (!match) {
		return undefined;
	}

	log.info(`${req.user.display_name} matched with ${match.partnerId}!`);

	const user = req.user;
	const partner = await userService.findById(partnerId);

	if (!user) {
		// This should never happen, but we're doing it for the symmetry
		throw new errors.InternalServerError();
	}
	if (!partner) {
		throw new errors.InternalServerError();
	}

	// Send the partner the notification first (the current user sees it anyways)
	// There is a delay in sending notifications, since we don't want to run into rate limits
	notification.enqueueMatchNotification(partner, user).catch(undefined); // we're intentionally not awaiting this promise
	notification.enqueueMatchNotification(user, partner).catch(undefined); // we're intentionally not awaiting this promise

	return match;
}
