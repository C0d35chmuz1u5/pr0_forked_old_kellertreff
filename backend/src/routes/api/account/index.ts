import * as errors from "http-errors";
import { Type } from "@fastify/type-provider-typebox";

import type { ServerInstance } from "../../../server.js";
import type {
	NotificationPreferences,
	ProfileInfo,
	ProfileStats,
	SettingsResponse,
} from "../../../shared/api-types.js";
import log from "../../../log.js";
import { ok } from "../../../api-helper.js";
import assertUser from "../../../types/assertUser.js";
import {
	type GeoLocation,
	GeoLocationType,
	NullableType,
	UserNameType,
	type UserTagSet,
	UserTagSetType,
	type UserText,
	UserTextType,
} from "../../../shared/typebox.js";
import * as userService from "../../../service/user.js";
import * as profileService from "../../../service/profile.js";
import type { User } from "../../../db/model.js";

export default async function routes(server: ServerInstance) {
	// biome-ignore lint/suspicious/noExplicitAny: types of source package are wrong
	server.addHook("onRequest", server.csrfProtection as any);
	server.addHook("preHandler", server.auth([server.requiresAuth]));

	server.get("/settings", async (req, res) => {
		assertUser(req);
		res.send(ok(await createSettingsResponse(req.user)));
	});

	server.patch(
		"/settings",
		{
			schema: {
				body: Type.Object({
					// TODO: ???
				}),
			},
		},
		async (req, res) => {
			assertUser(req);

			log.info(`${req.user.display_name} updated his/hers/its settings`);

			const updatedUser = await userService.findById(req.user.id);
			if (!updatedUser) {
				throw new errors.InternalServerError();
			}

			res.send(ok(await createSettingsResponse(updatedUser)));
		},
	);

	server.get("/profile", async (req, res) => {
		assertUser(req);
		res.send(ok(await createProfileResponse(req.user)));
	});

	server.patch(
		"/profile",
		{
			schema: {
				body: Type.Object({
					currentText: UserTextType,
					currentTags: UserTagSetType,
					location: NullableType(GeoLocationType),
				}),
			},
		},
		async (req, res) => {
			assertUser(req);

			const currentText = req.body.currentText as UserText;
			const currentTags = req.body.currentTags as UserTagSet;
			const location = (req.body.location ?? null) as GeoLocation | null;

			await profileService.updateProfile(req.user.id, currentText, currentTags, location);
			// TODO: Set edits remaining via database trigger

			log.info(`${req.user.display_name} updated his/hers/its profile`);

			const updatedUser = await userService.findById(req.user.id);
			if (!updatedUser) {
				throw new errors.InternalServerError();
			}

			res.send(ok(await createProfileResponse(updatedUser)));
		},
	);

	server.delete(
		"/profile",
		{
			schema: {
				body: Type.Object({
					userName: UserNameType,
				}),
			},
		},
		async (req, res) => {
			assertUser(req);

			const userNameConfirmation = req.body.userName;
			const sessionUserName = req.user.display_name;
			if (!userNameConfirmation || userNameConfirmation !== sessionUserName) {
				throw new errors.BadRequest();
			}

			log.info(`${req.user.display_name} ${req.user.id} deleted`);

			await userService.deleteById(req.user.id);
			res.send(ok());
		},
	);

	server.get("/profile/stats", async (req, res) => {
		const u = req.user;
		if (!u) {
			throw new errors.BadRequest();
		}

		const stats: ProfileStats = {
			id: u.id,
			currentText: (u.current_text ?? "") as UserText,
			name: u.display_name,
			score: u.score,
			wantsNotifications: !!u.wants_spam,
		};

		res.send(ok(stats));
	});

	server.patch(
		"/notification-preferences",
		{
			schema: {
				body: Type.Object({
					wantsNotifications: Type.Boolean(),
				}),
			},
		},
		async (req, res) => {
			assertUser(req);

			const wantsNotifications = req.body.wantsNotifications;
			await profileService.updateNotificationSettings(req.user.id, wantsNotifications);

			res.send(ok({ wantsNotifications } as NotificationPreferences));
		},
	);
}

async function createSettingsResponse(u: User): Promise<SettingsResponse> {
	return {
		id: u.id,
		name: u.display_name,
		wantsNotifications: !!u.wants_spam,
		mustCompleteProfile: !(await userService.hasCompletedProfileSetup(u)),
	};
}

async function createProfileResponse(u: User): Promise<ProfileInfo> {
	const location =
		u.country_code === null || u.zip_code === null
			? null
			: ({
					countryCode: u.country_code,
					zipCode: u.zip_code,
				} as unknown as GeoLocation);

	return {
		id: u.id,
		name: u.display_name,
		currentText: (u.current_text ?? "") as UserText,
		tags: await profileService.getTagsOfUser(u.id),
		mustCompleteProfile: !(await userService.hasCompletedProfileSetup(u)),
		location,
		// editsRemaining: 1337, // TODO
		// matches: 0, // TODO
		// votes: 0, // TODO
		registered: u.created_at as unknown as string,
	};
}
