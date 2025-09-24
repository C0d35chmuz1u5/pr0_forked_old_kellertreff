import { readFile } from "node:fs/promises";

import dotenv from "dotenv";

dotenv.config();

for (const [key, value] of Object.entries(process.env)) {
	if (!key.endsWith("_FILE") || !value) {
		continue;
	}
	// Save value to process.env for future access, so no need to access the file system again
	const keyToSet = key.slice(0, -"_FILE".length);
	process.env[keyToSet] = await readFile(value, "utf8");
}

const env = process.env;

if (!env.SESSION_SECRET) {
	throw new Error("SESSION_SECRET is not set");
}

export default {
	publicUrl: env.PUBLIC_URL ?? "http://localhost:5173",
	redis: {
		url: env.REDIS_URL ?? "redis://127.0.0.1",
	},
	api: {
		port: Number(env.API_PORT ?? "8080"),
		host: env.API_HOST ?? "0.0.0.0",
		sessionSecret: env.SESSION_SECRET,
	},
	db: {
		path: env.DATABASE_PATH ?? "KT.db",
	},
	sentry: {
		dsn: env.SENTRY_DSN,
	},
	pr0gramm: {
		clientId: env.PR0GRAMM_CLIENT_ID ?? "kt",
		clientSecret: env.PR0GRAMM_CLIENT_SECRET ?? "sicheres-client-secret",
		loginRedirectUrlBase: env.PR0GRAMM_LOGIN_REDIRECT_URL_BASE ?? "http://localhost:9090",
	},
};
