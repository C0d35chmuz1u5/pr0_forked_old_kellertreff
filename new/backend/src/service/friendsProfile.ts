import type { InterestId, UserFriendsProfile, UserId } from "@/db/model.js";
import db from "@db";

export interface UserFriendsProfileWithInterests extends UserFriendsProfile {
  interests: { id: InterestId; content: string }[];
}

export async function findForUser(
  userId: UserId,
  ctx = db(),
): Promise<UserFriendsProfileWithInterests | undefined> {
  const profile = await ctx
    .selectFrom("user_friends_profile")
    .where("user_id", "=", userId)
    .selectAll()
    .executeTakeFirst();

  if (!profile) {
    return undefined;
  }

  // Maybe put this into a single query

  const interests = await ctx
    .selectFrom("user_friends_interest")
    .where("profile_id", "=", profile.id)
    .orderBy("priority asc")
    .select(["id", "content"])
    .execute();

  return {
    ...profile,
    interests,
  };
}

export async function updateProfile(
  userId: UserId,
  enabled: boolean,
  bio: string,
  interests: string[],
): Promise<UserFriendsProfileWithInterests> {
  return await db()
    .transaction()
    .execute(async tx => {
      const profile = await tx
        .insertInto("user_friends_profile")
        .values({
          user_id: userId,
          enabled,
          bio,
        })
        .onConflict(oc => oc.column("user_id").doUpdateSet({ enabled, bio }))
        .returningAll()
        .executeTakeFirstOrThrow();

      await tx.deleteFrom("user_friends_interest").where("profile_id", "=", profile.id).execute();

      if (interests.length > 0) {
        await tx
          .insertInto("user_friends_interest")
          .values(
            interests.map((id, i) => ({
              profile_id: profile.id,
              priority: i,
              content: id,
            })),
          )
          .execute();
      }

      const u = await findForUser(userId, tx);
      if (!u) {
        throw new Error("User not found");
      }
      return u;
    });
}
