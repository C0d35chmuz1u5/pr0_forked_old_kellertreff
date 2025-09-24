import { sql } from "kysely";
import type { UserText, UserId, UserTagSet } from "../shared/typebox.js";
import {
	asSQLiteBoolean,
	type DBBool,
	type ParsedEntity,
	parseTimestamps,
	type Timestamp,
} from "./db-types.js";
import db from "./connection.js";
import type { GeoPoint, Latitude, Longitude } from "../spatial.js";
import type { KtDatabase, User } from "./model.js";

//#region CRUD

export interface VoteOfUser {
	partnerId: UserId;
	text: UserText;
	votedAt: Date;
}
export async function findOfUser(
	id: UserId,
	limit: number,
	ctx: KtDatabase = db(),
): Promise<VoteOfUser[]> {
	// TODO: Maybe we don't need the candidate id in the FE

	const res = await ctx
		.selectFrom("vote")
		.where("user", "=", id)
		.select(eb => [
			"candidate",
			"candidate_text",
			"decision",
			eb
				.selectFrom("tag_assignment")
				.whereRef("user", "=", "vote.candidate")
				.select(({ fn }) =>
					fn.agg<string>("JSON_GROUP_ARRAY", ["tag"]).as("candidate_tags"),
				)
				.as("candidate_tags"),
			"created_at",
		])
		.orderBy("created_at", "desc")
		.limit(limit)
		.execute();

	return res
		.map(row => parseTimestamps(row))
		.map(row => ({
			partnerId: row.candidate,
			text: row.candidate_text as UserText,
			decision: !!row.decision,
			tags: row.candidate_tags ? (JSON.parse(row.candidate_tags) as UserTagSet) : [],
			votedAt: row.created_at,
		}));
}

export async function setVote(
	originator: UserId,
	candidate: UserId,
	decision: boolean,
	ctx: KtDatabase = db(),
): Promise<void> {
	await sql`
		INSERT INTO vote
		(user, candidate, decision, candidate_text)
		SELECT
			${originator},
			${candidate},
			${asSQLiteBoolean(decision)},
			u.current_text
		FROM user u
			WHERE u.id = ${candidate}
		`.execute(ctx);
}

export async function changeVote(
	originator: UserId,
	candidate: UserId,
	newDecision: boolean,
	ctx: KtDatabase = db(),
): Promise<void> {
	await ctx
		.updateTable("vote")
		.set({
			decision: asSQLiteBoolean(newDecision),
		})
		.where("user", "=", originator)
		.where("candidate", "=", candidate)
		.where("decision", "!=", asSQLiteBoolean(newDecision))
		.execute();
}

export interface PendingVote {
	userId: UserId;
	currentText: UserText;
	tags: UserTagSet;
	location: GeoPoint | undefined;
}
export async function findPendingVotesOfUser(
	user: User,
	maxVotesPerDay: number,
	ctx: KtDatabase = db(),
): Promise<PendingVote[]> {
	// We currently have the problem that we cannot check if a user (only) votes for a person that is in his/her candidates
	// It is therefore possible for the user to vote for arbitrary IDs.
	// We don't really care for now. The user is constrained to maxVotesPerDay anyway.
	// A user exploiting this might even get less matches because he doesn't follow our recommendation (as the resot of the users do)

	// We some day might refactor to have a voting queue again. This way, the voting user may not know the user ID of the candidate (we could use a voting-token instead)

	// See 2.7 in docs for "NOT EXISTS" https://www.sqlite.org/tempfiles.html#views

	// This is a new approach, we need to test this for quality and under load
	/*
    const maximumCandidatesWithMatchingTag = 100;
    const maximumRandomUsers = 100;
    */

	const res = await sql`
    SELECT
        b.id as id,
        b.current_text as current_text,
        (SELECT JSON_GROUP_ARRAY(ta.tag) FROM tag_assignment ta WHERE ta.user = b.id) as tags,
        geo.latitude as latitude,
        geo.longitude as longitude
    FROM (
            SELECT *
            FROM complete_profile u
            WHERE
                u.id != ${user.id}
                AND
                NOT EXISTS (
                    SELECT 1
                    FROM vote v
                    WHERE v.user = ${user.id} AND v.candidate = u.id
                )
            UNION
            SELECT * FROM (
                SELECT *
                FROM complete_profile h
                WHERE
                    id = 1
                    AND
                    id != ${user.id}
                    AND
                    NOT EXISTS (
                        SELECT 1
                        FROM vote v
                        WHERE v.user = ${user.id} AND v.candidate = 1
                    )
            )
            ORDER BY last_activity DESC
            LIMIT 100
        ) as b

    LEFT JOIN geo_location geo
        ON b.country_code = geo.country_code AND b.zip_code = geo.zip_code

    LIMIT
        MAX(0, ${maxVotesPerDay} - (
            SELECT count(1)
            FROM vote v
            WHERE
                v.user = ${user.id}
                AND
                v.created_at >= datetime('now', 'start of day')
        ))
    `.execute(ctx);

	return (
		res.rows
			// biome-ignore lint/suspicious/noExplicitAny: raw sql query
			.map((row: any) => ({
				userId: row.id as UserId,
				currentText: row.current_text as UserText,
				tags: JSON.parse(row.tags) as UserTagSet,

				// Note that the lat/long can also be null if the user entered an invalid zip_code, as they are not checked
				location:
					!row.latitude || !row.longitude
						? undefined
						: {
								latitude: row.latitude as Latitude,
								longitude: row.longitude as Longitude,
							},
			}))
	);
}

//#endregion
//#region Stats

export async function getVotesOfToday(
	ctx: KtDatabase = db(),
): Promise<{ up: number; down: number }> {
	const res = await ctx
		.selectFrom("vote")
		.select(({ fn }) => fn.countAll<number>().as("number"))
		.select("decision")
		.where(sql`datetime('now', 'start of day')`, "<=", "created_at")
		.execute();

	return {
		up: res.find(f => !!f.decision)?.number ?? 0,
		down: res.find(f => !f.decision)?.number ?? 0,
	};
}

export async function getTotalNumberOfVotes(ctx: KtDatabase = db()): Promise<number | undefined> {
	const res = await ctx
		.selectFrom("vote")
		.select(({ fn }) => fn.countAll<number>().as("votes"))
		.executeTakeFirstOrThrow();
	return res.votes ?? 0;
}

export async function getLastVoteTime(ctx: KtDatabase = db()): Promise<Date | undefined> {
	const res = await ctx
		.selectFrom("vote")
		.select(({ fn }) => fn.max("created_at").as("created_at"))
		.executeTakeFirstOrThrow();
	return parseTimestamps(res)?.created_at;
}

//#endregion

interface Vote {
	user: UserId;
	candidate: UserId;
	vote: DBBool | null;

	created_at: Timestamp;
	modified_at: Timestamp;
}
export type ParsedVote = ParsedEntity<Vote, "created_at" | "modified_at">;
