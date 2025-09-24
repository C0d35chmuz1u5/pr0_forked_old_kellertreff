import { createTokenGenerator } from "cybertoken";

import type { User, UserId, UserSession } from "@/db/model.js";
import db from "@db";

const sessionTokenGenerator = createTokenGenerator({
  prefixWithoutUnderscore: "kts",
});

export async function findUser(session: string): Promise<(User & UserSession) | undefined> {
  if (!sessionTokenGenerator.isTokenString(session)) {
    return undefined;
  }

  return await db()
    .selectFrom("user_session")
    .where("token", "=", session)
    .innerJoin("user", "user.id", "user_session.user_id")
    .selectAll()
    .executeTakeFirst();
}

export async function logUse(session: string, userAgent: string, usedAt: Date) {
  await db()
    .updateTable("user_session")
    .where("token", "=", session)
    .set({
      last_used_at: usedAt,
      user_agent: userAgent,
    })
    .execute();
}

export async function deleteSession(session: string) {
  await db().deleteFrom("user_session").where("token", "=", session).execute();
}

export async function createSession(
  userId: UserId,
  userAgent: string,
  ctx = db(),
): Promise<string> {
  const token = sessionTokenGenerator.generateToken();
  await ctx
    .insertInto("user_session")
    .values({
      user_id: userId,
      user_agent: userAgent,
      token,
    })
    .execute();
  return token;
}
