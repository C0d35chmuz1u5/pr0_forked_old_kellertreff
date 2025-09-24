//@ts-check
import { setTimeout } from "node:timers/promises";

import * as redis from "redis";
import * as sentry from "@sentry/node";

import config from "./config.js";
import log from "./log.js";

import { type CookieSession, createApiClient, type apiTypes } from "@pr0gramm/api";

if (config.sentry.dsn) {
	sentry.init({
		dsn: config.sentry.dsn,
	});
}

const apiClient = createApiClient({
	baseUrl: config.pr0gramm.apiBase,
	userAgent: "Kellertreff/1.0",
});

const MAX_NUMBER_OF_ATTEMPTS = 10;

const redisClient = redis.createClient({
	url: process.env.REDIS_URL ?? "redis://127.0.0.1",
});

let session: CookieSession | undefined = undefined;

async function sendPrivateMessage(session: CookieSession, notification: NotificationTask) {
	try {
		if (config.dryMode) {
			log.info(`Pretending to send message to ${notification.recipient}`);
		} else {
			log.info(`Sending message to ${notification.recipient}`);
			await apiClient.post(session, "/inbox/post", {
				comment: notification.message,
				recipientName: notification.recipient,
			} as apiTypes.SendMessageOptionsByName);
		}

		await redisClient.rPush("sent-notification", JSON.stringify(notification));
	} catch (e) {
		log.error(e, `Error sending ${notification.kind} message to ${notification.recipient}`);

		if (notification.attempt >= MAX_NUMBER_OF_ATTEMPTS) {
			try {
				await redisClient.rPush("dropped-notification", JSON.stringify(notification));
			} catch {
				log.error(
					e,
					`Tried to send message to ${notification.recipient} ${notification.attempt} times. We're giving up!`,
				);
			}
			return;
		}

		await requeuePrivateMessage(notification);
	}
}

function requeuePrivateMessage(notification: NotificationTask) {
	return redisClient.rPush(
		"notification",
		JSON.stringify({
			...notification,
			attempt: notification.attempt + 1,
		}),
	);
}

interface NotificationTask {
	originator?: string;
	recipient: string;
	kind: "info" | "match";
	message: string;
	attempt: number;
}

async function* fetchTasks(): AsyncGenerator<NotificationTask> {
	while (true) {
		const message = await redisClient.blMove(
			"notification",
			"processed-notification",
			"RIGHT",
			"LEFT",
			0,
		);

		if (!message) continue;

		let content: NotificationTask;
		try {
			content = JSON.parse(message);
		} catch {
			log.error("fetch", "Unable to process message: " + message);
			continue;
		}

		if (!content) {
			continue;
		}

		yield content;
	}
}

log.info("Service started");
log.info(`dryMode? ${config.dryMode}`);

if (config.dryMode) {
	log.info("Skipping login on pr0gramm.com");
} else {
	log.info("Attempting login on pr0gramm.com...");

	if (!config.pr0gramm.user || !config.pr0gramm.password) {
		log.warn("Username or password is falsy :S");
		process.exit(1);
	}

	const loginResult = await apiClient.logIn({
		userName: config.pr0gramm.user,
		password: config.pr0gramm.password,
	});

	if (!loginResult.ok) {
		log.error(`Could not log in with user "${config.pr0gramm.user}" 😭`, loginResult);
		process.exit(2);
	}
	log.info(`Logged in as ${loginResult.session.userName}`);

	session = loginResult.session;
}

if (!session) {
	log.error("No session available. Exiting...");
	process.exit(3);
}

log.info("Connecting to redis...");
await redisClient.connect();

// HACK to check if sending a message currently works
requeuePrivateMessage({
	originator: "pm-service",
	recipient: "holzmaster",
	kind: "info",
	message: `Der PM-Service wurde gestartet und scheint zu funktionieren\n\n${new Date().toISOString()}`,
	attempt: 0,
});

for await (const notification of fetchTasks()) {
	await sendPrivateMessage(session, notification);
	await setTimeout(30 * 1000);
}
