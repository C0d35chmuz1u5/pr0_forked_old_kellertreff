import { sql } from "kysely";

import type { UserTagSet, UserId, UserName, UserText, TagList } from "../shared/typebox.js";
import { parseTimestamps, type Timestamp } from "./db-types.js";
import db from "./connection.js";
import type { KtDatabase } from "./model.js";

//#region CRUD

export interface MatchedVote {
	partnerId: UserId;
	partnerName: UserName;
	partnerText: UserText;
	partnerTags: UserTagSet;
	matchedAt: Date;
}
export async function findAllOfUser(id: UserId, ctx: KtDatabase = db()): Promise<MatchedVote[]> {
	const res = await sql`
        SELECT
            a.candidate as partner_id,
            user_b.display_name as partner_name,
            a.candidate_text as candidate_text,
            (SELECT JSON_GROUP_ARRAY(tag) FROM tag_assignment WHERE user = user_b.id) as candidate_tags,
            max(a.created_at, b.created_at) as created_at
        FROM vote a
        JOIN vote b
            ON a.candidate = b.user
        JOIN user user_b
            ON a.candidate = user_b.id
        WHERE
            a.user = ${id}
            AND
            b.candidate = ${id}
            AND
            a.decision = true
            AND
            b.decision = true
        ORDER BY max(a.created_at, b.created_at) DESC
    `.execute(ctx);

	return (
		res.rows
			.map(parseTimestamps)
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			.map((row: any /* TODO */) => ({
				partnerId: row.partner_id,
				partnerName: row.partner_name,
				partnerText: row.candidate_text,
				partnerTags: JSON.parse(row.candidate_tags) as UserTagSet,
				matchedAt: row.created_at,
			}))
	);
}

export async function isMatchByVote(
	user: UserId,
	candidate: UserId,
	ctx: KtDatabase = db(),
): Promise<MatchedVote | undefined> {
	const res = await sql`
		SELECT
			a.candidate as partner_id,
			user_b.display_name as partner_name,
			a.candidate_text as candidate_text,
			(SELECT JSON_GROUP_ARRAY(tag) FROM tag_assignment WHERE user = a.user) as candidate_tags,
			max(a.created_at, b.created_at) as created_at
		FROM vote a
		JOIN vote b
			ON a.candidate = b.user
		JOIN user user_b
			ON a.candidate = user_b.id
		WHERE
			a.user = ${user}
			AND
			b.candidate = ${user}
			AND
			b.user = ${candidate}
			AND
			a.decision = true
			AND
			b.decision = true
	`.execute(ctx);

	const row = res.rows[0] ?? undefined;
	if (!row) {
		return undefined;
	}

	const parsedRes = parseTimestamps(
		row as {
			partner_id: UserId;
			partner_name: UserName;
			candidate_text: UserText;
			candidate_tags: TagList;
			created_at: Timestamp;
		},
	);
	return {
		partnerId: parsedRes.partner_id,
		partnerName: parsedRes.partner_name,
		partnerText: parsedRes.candidate_text,
		partnerTags: JSON.parse(parsedRes.candidate_tags) as UserTagSet,
		matchedAt: parsedRes.created_at,
	};
}

//#endregion
//#region Stats

export async function getNumberOfMatches(ctx: KtDatabase = db()): Promise<number | undefined> {
	const res = await ctx
		.selectFrom("user_notification")
		.select(({ fn }) => fn.countAll<number>().as("matches"))
		.executeTakeFirstOrThrow();

	// TODO: Use match table in the future

	return ((res.matches ?? 0) / 2) | 0;
}

//#endregion
