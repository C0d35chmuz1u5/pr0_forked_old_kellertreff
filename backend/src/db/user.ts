import type { UserText, CountryCode, ZipCode, TagList } from "../shared/typebox.js";
import { asSQLiteBoolean, parseTimestamps } from "./db-types.js";
import db from "./connection.js";
import type { GeoPoint } from "../spatial.js";
import type { KtDatabase, User } from "./model.js";

export interface GeoLocatable {
	country_code: CountryCode;
	zip_code: ZipCode;
}

function hasGeoLocation(user: User): user is User & GeoLocatable {
	return !!(user.country_code && user.zip_code);
}

export async function getGeoLocation(
	user: User,
	ctx: KtDatabase = db(),
): Promise<GeoPoint | undefined> {
	if (!hasGeoLocation(user)) {
		return undefined;
	}

	return await ctx
		.selectFrom("geo_location")
		.where("country_code", "=", user.country_code)
		.where("zip_code", "=", user.zip_code)
		.selectAll()
		.executeTakeFirst();
}

//#region Stats

export async function getNumberOfUsers(ctx: KtDatabase = db()): Promise<number> {
	const res = await ctx
		.selectFrom("user")
		.select(({ fn }) => fn.count<number>("id").as("users"))
		.executeTakeFirstOrThrow();
	return res.users ?? 0;
}

export async function getNumberOfUsersWithCompleteProfile(ctx: KtDatabase = db()): Promise<number> {
	const res = await ctx
		.selectFrom("user")
		.where("current_text", "is not", null)
		.where("current_text", "<>", "" as UserText)
		.where(({ exists, selectFrom }) =>
			exists(selectFrom("tag_assignment").whereRef("user", "=", "user.id").select("id")),
		)
		.select(({ fn }) => fn.countAll<number>().as("users"))
		.executeTakeFirstOrThrow();
	return res.users;
}

export async function getNumberOfUsersWithEnabledNotifications(
	ctx: KtDatabase = db(),
): Promise<number> {
	const res = await ctx
		.selectFrom("user")
		.where("wants_spam", "=", asSQLiteBoolean(true))
		.select(({ fn }) => fn.count<number>("id").as("enabled_notifications"))
		.executeTakeFirstOrThrow();

	return res.enabled_notifications;
}

export async function getLastRegistrationTime(ctx: KtDatabase = db()): Promise<Date | undefined> {
	const res = await ctx
		.selectFrom("user")
		.select(({ fn }) => fn.max("created_at").as("created_at"))
		.executeTakeFirstOrThrow();

	return parseTimestamps(res)?.created_at;
}

export interface LocationStatEntry {
	country_code: CountryCode;
	users: number;
}
export async function getNumberOfUsersWithLocation(
	ctx: KtDatabase = db(),
): Promise<LocationStatEntry[]> {
	return (await ctx
		.selectFrom("user")
		.where("country_code", "is not", null)
		.select("country_code")
		.select(({ fn }) => fn.countAll<number>().as("users"))
		.groupBy("country_code")
		.execute()) as LocationStatEntry[];
}
//#endregion
