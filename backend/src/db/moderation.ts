import { createHash } from "node:crypto";

import type { Pr0grammIdentifier, HashedName } from "../shared/typebox.js";

import db from "./connection.js";
import * as userService from "../service/user.js";
import type { KtDatabase, User } from "./model.js";

export async function banAndDeleteUser(user: User, ctx: KtDatabase = db()): Promise<void> {
	if (!user.identifier) {
		throw new Error("User has no identifier");
	}

	const hashedId = hashPr0grammId(user.identifier);

	await ctx.transaction().execute(async tx => {
		await tx
			.insertInto("banned_user")
			.values({
				pr0gramm_id_hash: hashedId,
			})
			.execute();
		await userService.deleteById(user.id, tx);
	});
}

export async function getBannedUserCount(ctx: KtDatabase = db()): Promise<number> {
	const res = await ctx
		.selectFrom("banned_user")
		.select(({ fn }) => fn.countAll<number>().as("banned_users"))
		.executeTakeFirstOrThrow();
	return res.banned_users;
}

export async function isUserBanned(
	pr0grammIdHash: Pr0grammIdentifier,
	ctx: KtDatabase = db(),
): Promise<boolean> {
	const hashedId = hashPr0grammId(pr0grammIdHash);
	const res = await ctx
		.selectFrom("banned_user")
		.where("pr0gramm_id_hash", "=", hashedId)
		.select(({ fn }) => fn.countAll<number>().as("banned_users"))
		.executeTakeFirstOrThrow();

	return res.banned_users > 0;
}

/**
 * The pr0gramm identifier already is some kind of a hash, so it would not actually be necessary to hash it to prevent data leakage.
 * But we do it anyway lol
 */
function hashPr0grammId(value: Pr0grammIdentifier): HashedName {
	return createHash("sha256").update(value, "utf-8").digest("base64") as HashedName;
}
