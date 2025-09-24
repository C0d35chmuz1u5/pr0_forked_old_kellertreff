import * as errors from "http-errors";
import { Type } from "@fastify/type-provider-typebox";

import type { ServerInstance } from "../../../server.js";
import { UserIdType, type UserId } from "../../../shared/typebox.js";
import type { Stats } from "../../../shared/api-types.js";
import log from "../../../log.js";
import * as db from "../../../db/index.js";
import { ok } from "../../../api-helper.js";
import * as userService from "../../../service/user.js";

export default async function routes(server: ServerInstance) {
	// server.addHook("onRequest", server.csrfProtection as any);

	server.addHook(
		"preHandler",
		server.auth([server.requiresAuth, server.requiresAdmin], {
			relation: "and",
		}),
	);

	server.get("/info", async (_req, res) => {
		const bannedUsers = await db.moderation.getBannedUserCount();
		res.send(ok({ bannedUsers }));
	});

	server.get("/stats", async (_req, reply) => {
		const [
			lastRegistration,
			users,
			totalVotes,
			lastVote,
			usersWithNotificationsEnabled,
			countryStats,
			completeProfiles,
			notificationsPending,
			sentNotifications,
			totalMatches,
			votesOfToday,
		] = await Promise.all([
			db.user.getLastRegistrationTime(),
			db.user.getNumberOfUsers(),
			db.vote.getTotalNumberOfVotes(),
			db.vote.getLastVoteTime(),
			db.user.getNumberOfUsersWithEnabledNotifications(),
			db.user.getNumberOfUsersWithLocation(),
			db.user.getNumberOfUsersWithCompleteProfile(),
			db.notification.getUnsentNotificationCount(),
			db.notification.getSentNotificationCount(),
			db.match.getNumberOfMatches(),
			db.vote.getVotesOfToday(),
		]);

		reply.send(
			ok({
				lastVote,
				lastRegistration,
				users,
				usersWithNotificationsEnabled,
				sentNotifications,
				notificationsPending,
				completeProfiles,
				totalVotes,
				totalMatches,
				votesOfToday,
				countryStats: countryStats.map(e => ({
					countryCode: e.country_code,
					users: e.users,
				})),
			} as Stats),
		);
	});

	server.post(
		"/ban",
		{
			schema: {
				body: Type.Object({
					userId: UserIdType,
				}),
			},
		},
		async (req, res) => {
			if (!req.user) {
				throw new errors.Unauthorized();
			}

			const userToBan = await userService.findById(req.body.userId as UserId);
			if (!userToBan) {
				throw new errors.NotFound();
			}

			log.info(`${req.user.display_name} is banning user with ID ${userToBan.id}`);

			db.moderation.banAndDeleteUser(userToBan);

			res.send(ok({ bannedUser: userToBan }));
		},
	);
}
