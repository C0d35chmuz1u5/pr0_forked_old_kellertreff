import type { InterestId, UserDatingProfile, UserId } from "@/db/model.js";
import db from "@db";

export interface UserDatingProfileWithInterests extends UserDatingProfile {
  interests: { id: InterestId; name: string }[];
}

export async function findForUser(
  userId: UserId,
): Promise<UserDatingProfileWithInterests | undefined> {
  const profile = await db()
    .selectFrom("user_dating_profile")
    .where("user_id", "=", userId)
    .selectAll()
    .executeTakeFirst();

  if (!profile) {
    return undefined;
  }

  // Maybe put this into a single query

  const interests = await db()
    .selectFrom("user_dating_profile_interest")
    .where("profile_id", "=", profile.id)
    .innerJoin("interest", "interest.id", "interest_id")
    .orderBy("priority asc")
    .select(["interest.id", "interest.name"])
    .execute();

  return {
    ...profile,
    interests,
  };
}

export interface Interest {
  id: number;
  name: string;
}
export async function getAllInterests(): Promise<Interest[]> {
  const interests = await db().selectFrom("interest").selectAll().execute();
  return interests.map(row => ({ id: row.id, name: row.name }));
}

export async function addInterest(content: string): Promise<Interest> {
  return await db()
    .insertInto("interest")
    .values({ name: content })
    .onConflict(oc => oc.column("name").doUpdateSet({ name: content }))
    .returning(["id", "name"])
    .executeTakeFirstOrThrow();
}
