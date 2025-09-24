import type { UserId, UserSettings } from "@/db/model.js";
import db from "@db";

export async function findForUser(userId: UserId): Promise<UserSettings> {
  return await db()
    .selectFrom("user_settings")
    .where("user_id", "=", userId)
    .selectAll()
    .executeTakeFirstOrThrow();
}

export type SettableUserSettings = {
  dmSpamEnabled: boolean;
};
export async function updateForUser(
  userId: UserId,
  settings: SettableUserSettings,
): Promise<UserSettings> {
  return await db()
    .updateTable("user_settings")
    .set({
      dm_spam_enabled: settings.dmSpamEnabled,
    })
    .where("user_id", "=", userId)
    .returningAll()
    .executeTakeFirstOrThrow();
}
