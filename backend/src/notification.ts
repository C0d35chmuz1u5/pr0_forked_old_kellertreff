import log from "./log.js";
import type { UserName } from "./shared/typebox.js";
import * as db from "./db/index.js";
import { APP_NAME } from "./shared/constants.js";
import { getClient } from "./redis.js";
import type { User } from "./db/model.js";

// TODO: Make originator non-undefined once info messages are not in the main application anymore
function dispatchMessage(
	kind: "info" | "match",
	originator: User | undefined,
	recipient: User,
	message: string,
): Promise<unknown> {
	return getClient().rPush(
		"notification",
		JSON.stringify({
			// not "sender", because _we_ are the sender. But the originator is the reason we're doing it in the first place
			originator: originator?.display_name,
			recipient: recipient.display_name,
			kind,
			message,
			attempt: 0,
		}),
	);
}

export async function enqueueMatchNotification(user: User, partner: User): Promise<void> {
	await db.notification.setNotificationStatus(user.id, partner.id, false);
	const message = createMatchMessage(user.display_name, partner.display_name);

	try {
		await dispatchMessage("match", partner, user, message);

		await db.notification.setNotificationStatus(user.id, partner.id, true);
	} catch (e) {
		log.error(e, `Error dispatching message to ${user.display_name}`);
	}
}

const signature = `
Dein ${APP_NAME}
P.S.: Ich bin ein Bot und antworte nicht auf Nachrichten.
`.trim();

const appLink = `https://${APP_NAME.toLowerCase()}.com`;

function createMatchMessage(userName: UserName, partnerName: UserName): string {
	return `
Hallo ${userName},

Du bist auf ${appLink} angemeldet und hast einen Match erhalten!

Dein Partner ist @${partnerName}. Schreib' ihn/sie/es doch direkt an:
https://pr0gramm.com/inbox/messages/${encodeURIComponent(partnerName)}

Falls du vergessen hast, was die Person in ihrem Text stehen hatte, kannst du hier noch einmal nachschauen:
https://kellertreff.com/decisions/matches#${partnerName}

Viel Spaß noch!

${signature}
`;
}
