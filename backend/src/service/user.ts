import { sql } from "kysely";

import { parseTimestamps } from "../db/db-types.js";
import { isUserText } from "../shared/types.js";
import type { ApiAccessToken, Pr0grammIdentifier, UserId, UserName } from "../shared/typebox.js";

import db from "../db/connection.js";
import type { KtDatabase, User } from "../db/model.js";

import * as profileService from "./profile.js";

export async function getAll(ctx: KtDatabase = db()): Promise<User[]> {
	const res = await ctx.selectFrom("user").selectAll().execute();
	return res.map(u => parseTimestamps(u, "last_activity"));
}

export async function deleteById(id: UserId, ctx: KtDatabase = db()): Promise<void> {
	// The rest should deleted via DB constraints
	await ctx.deleteFrom("user").where("id", "=", id).execute();
}

//#region Find

export async function findById(id: UserId, ctx: KtDatabase = db()): Promise<User | undefined> {
	const res = await ctx.selectFrom("user").where("id", "=", id).selectAll().executeTakeFirst();

	return res ? parseTimestamps(res, "last_activity") : undefined;
}

async function findUserByExternalId(
	identifier: Pr0grammIdentifier,
	ctx: KtDatabase = db(),
): Promise<User | undefined> {
	const res = await ctx
		.selectFrom("user")
		.where("identifier", "=", identifier)
		.selectAll()
		.executeTakeFirst();

	return res ? parseTimestamps(res, "last_activity") : undefined;
}

async function findUserByName(name: UserName, ctx: KtDatabase = db()): Promise<User | undefined> {
	const res = await ctx
		.selectFrom("user")
		.where("display_name", "=", name)
		.selectAll()
		.executeTakeFirst();

	return res ? parseTimestamps(res, "last_activity") : undefined;
}

//#endregion

export async function hasCompletedProfileSetup(user: User): Promise<boolean> {
	return isUserText(user.current_text) && (await profileService.getTagCount(user.id)) > 0;
}

export async function createOrUpdateUser(
	accessToken: ApiAccessToken,
	refreshToken: string | null,
	identifier: Pr0grammIdentifier,
	userName: UserName,
	ctx: KtDatabase = db(),
): Promise<User> {
	const user = await findUserByExternalId(identifier, ctx);
	if (user) {
		return await ctx.transaction().execute(async tx => {
			await updateApiAccessToken(user.id, accessToken, tx);

			if (user.display_name !== userName) {
				await updateDisplayName(user.id, userName, tx);
			}
			const r = await findById(user.id, tx);
			if (!r) {
				throw new Error("Internal Server Error");
			}
			return r;
		});
	}

	const userByName = await findUserByName(userName, ctx);
	if (userByName) {
		return await ctx.transaction().execute(async tx => {
			await updatePr0grammIdentifier(userByName.id, identifier, tx);
			await updateApiAccessToken(userByName.id, accessToken, tx);
			const r = await findUserByExternalId(identifier, tx);
			if (!r) {
				throw new Error("Internal Server Error");
			}
			return r;
		});
	}

	return await createUser(accessToken, refreshToken, identifier, userName, ctx);
}

async function updateApiAccessToken(
	id: UserId,
	apiAccessToken: ApiAccessToken,
	ctx: KtDatabase = db(),
): Promise<void> {
	await ctx
		.updateTable("user")
		.set({
			api_access_token: apiAccessToken,
		})
		.where("id", "=", id)
		.execute();
}

async function updatePr0grammIdentifier(
	id: UserId,
	identifier: Pr0grammIdentifier,
	ctx: KtDatabase = db(),
): Promise<void> {
	await ctx
		.updateTable("user")
		.set({
			identifier,
		})
		.where("id", "=", id)
		.execute();
}

async function updateDisplayName(
	id: UserId,
	newName: UserName,
	ctx: KtDatabase = db(),
): Promise<void> {
	await ctx
		.updateTable("user")
		.set(() => ({
			display_name: newName,
			modified_at: sql`current_timestamp`,
		}))
		.where("id", "=", id)
		.execute();
}

async function createUser(
	accessToken: ApiAccessToken,
	refreshToken: string | null,
	identifier: Pr0grammIdentifier,
	userName: UserName,
	ctx: KtDatabase = db(),
): Promise<User> {
	const res = await ctx
		.insertInto("user")
		.values({
			display_name: userName,
			api_access_token: accessToken,
			identifier,
		})
		.returningAll()
		.executeTakeFirstOrThrow();
	return parseTimestamps(res, "last_activity");
}
