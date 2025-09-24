import type { ApiAccessToken, ExternalIdentifier, User, UserId, UserSession } from "@/db/model.js";
import log from "@/log.js";

import * as sessionService from "./session.js";

import db from "@db";

export async function createUser(
  displayName: string,
  externalId: ExternalIdentifier,
  token: ApiAccessToken,
  ctx = db(),
): Promise<User> {
  log.info(`Creating user ${displayName} with external id ${externalId}`);

  return await ctx.transaction().execute(async tx => {
    const createdUser = await tx
      .insertInto("user")
      .values({
        display_name: displayName,
        external_id: externalId,
        auth_api_access_token: token,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    await tx
      .insertInto("user_settings")
      .values({
        user_id: createdUser.id,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return createdUser;
  });
}

export async function createDebugUser(id: UserId) {
  const existing = await db()
    .selectFrom("user")
    .forUpdate()
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  if (!existing) {
    await createUser(`debug-${id}`, `debug-${id}`, "debug");
  }
}
