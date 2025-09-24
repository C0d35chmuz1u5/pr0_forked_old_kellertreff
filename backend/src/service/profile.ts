import type { KtDatabase } from "../db/model.js";
import type {
	CountryCode,
	GeoLocation,
	UserId,
	UserTagSet,
	UserText,
	ZipCode,
} from "../shared/typebox.js";
import db from "../db/connection.js";
import { asSQLiteBoolean } from "../db/db-types.js";

export async function updateProfile(
	id: UserId,
	newText: UserText,
	newTags: UserTagSet,
	location: GeoLocation | null,
	ctx: KtDatabase = db(),
) {
	await ctx.transaction().execute(async ctx => {
		await ctx
			.updateTable("user")
			.set({
				current_text: newText,
				country_code: (location?.countryCode as CountryCode) ?? null,
				zip_code: (location?.zipCode as ZipCode) ?? null,
			})
			.where("id", "=", id)
			.execute();
		await ctx.deleteFrom("tag_assignment").where("user", "=", id).execute();
		await ctx
			.insertInto("tag_assignment")
			.values(newTags.map(tag => ({ user: id, tag: tag.toLowerCase() })))
			.execute();
	});
}

export async function updateNotificationSettings(
	id: UserId,
	newValue: boolean,
	ctx: KtDatabase = db(),
): Promise<void> {
	await ctx
		.updateTable("user")
		.set({
			wants_spam: asSQLiteBoolean(newValue),
		})
		.where("id", "=", id)
		.execute();
}

export async function getTagsOfUser(id: UserId, ctx: KtDatabase = db()): Promise<UserTagSet> {
	const res = await ctx
		.selectFrom("tag_assignment")
		.where("user", "=", id)
		.select("tag")
		.execute();
	return res.map(row => row.tag) as UserTagSet;
}

export async function getTagCount(id: UserId, ctx: KtDatabase = db()): Promise<number> {
	const res = await ctx
		.selectFrom("tag_assignment")
		.where("user", "=", id)
		.select(({ fn }) => fn.countAll<number>().as("count"))
		.executeTakeFirstOrThrow();
	return res.count;
}
