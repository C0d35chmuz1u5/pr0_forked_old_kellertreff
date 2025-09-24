import type { UserId } from "../shared/typebox.js";
import { asSQLiteBoolean } from "./db-types.js";
import db from "./connection.js";
import { sql } from "kysely";
import type { KtDatabase } from "./model.js";

//#region CRUD

export async function setNotificationStatus(
	user: UserId,
	partner: UserId,
	status: boolean,
	ctx: KtDatabase = db(),
): Promise<void> {
	// This is a feature of SQLite, called UPSERT
	// https://stackoverflow.com/a/53088319
	await ctx
		.insertInto("user_notification")
		.values({
			user,
			partner,
			sent: asSQLiteBoolean(status),
		})
		.onConflict(oc =>
			oc.columns(["user", "partner"]).doUpdateSet({
				sent: asSQLiteBoolean(status),
			}),
		)
		.execute();
}

export async function getUnsentNotifications(ctx: KtDatabase = db()) {
	return await ctx
		.selectFrom("user_notification")
		.where("sent", "=", asSQLiteBoolean(false))
		.select(["user as userId", "partner as partnerId"])
		.orderBy("created_at", "desc")
		.execute();
}

//#endregion
//#region Stats

export async function getUnsentNotificationCount(ctx: KtDatabase = db()): Promise<number> {
	const res = await ctx
		.selectFrom("user_notification")
		.where("sent", "=", asSQLiteBoolean(false))
		.select(({ fn }) => fn.countAll<number>().as("notifications"))
		.executeTakeFirstOrThrow();
	return res.notifications;
}

export async function getSentNotificationCount(ctx: KtDatabase = db()): Promise<number> {
	const res = await ctx
		.selectFrom("user_notification")
		.where("sent", "=", asSQLiteBoolean(true))
		.select(({ fn }) => fn.countAll<number>().as("notifications"))
		.executeTakeFirstOrThrow();
	return res.notifications;
}

//#endregion

//#region Extended Notifications

export async function getUsersForExtendedNotifications(
	minInactiveDays: number,
	minDaysSinceLastNotification: number,
	ctx: KtDatabase = db(),
) {
	/*
    SELECT
        u.*,
        sn.modified_at as last_notification
    */

	return await ctx
		.selectFrom("user_with_outstanding_upvotes as u")
		.leftJoin("spam_notification as sn", "u.user", "sn.user")
		.where(sql`JULIANDAY('now') - JULIANDAY(u.last_activity)`, ">=", minInactiveDays)
		.where(eb =>
			eb.or([
				eb("sn.updated_at", "is", null),
				eb(
					sql`JULIANDAY('now') - JULIANDAY(sn.modified_at)`,
					">=",
					minDaysSinceLastNotification,
				),
			]),
		)
		.orderBy("u.last_activity", "asc")
		.orderBy("u.outstanding_upvotes", "asc")
		.select(["u.user as id", "u.display_name as name", "u.outstanding_upvotes as votes"])
		.execute();
}

export async function createExtendedNotificationMessage(
	user: UserId,
	outstandingUpVotes: number,
	ctx: KtDatabase = db(),
) {
	await ctx
		.insertInto("spam_notification")
		.values({
			user,
			amount: outstandingUpVotes,
		})
		.onConflict(oc =>
			oc.column("user").doUpdateSet({
				amount: outstandingUpVotes,
			}),
		)
		.execute();
}

//#endregion
