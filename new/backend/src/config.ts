import { readFile } from "node:fs/promises";

// Not needed for bun:
/*
import { loadEnvFile } from "node:process";

try {
	loadEnvFile();
} catch {
	// Ignore if no .env file is found
}
*/

for (const [key, value] of Object.entries(process.env)) {
  if (!key.endsWith("_FILE") || !value) {
    continue;
  }

  // Save value to process.env for future access, so no need to access the file system again
  const keyToSet = key.slice(0, -"_FILE".length);
  process.env[keyToSet] = await readFile(value, "utf8");
}

const env = process.env;
const nodeEnv = env.NODE_ENV ?? "development";

if (!env.PR0GRAMM_API_CLIENT_ID) {
  throw new Error("PR0GRAMM_API_CLIENT_ID is not set");
}
if (!env.PR0GRAMM_API_CLIENT_SECRET) {
  throw new Error("PR0GRAMM_API_CLIENT_SECRET is not set");
}
if (!env.WEB_AUTH_CALLBACK_URL) {
  throw new Error("WEB_AUTH_CALLBACK_URL is not set");
}

const appName = nodeEnv === "production" ? "kellertreff-v2" : "kellertreff-v2-debug";

export default {
  appName,
  release:
    env.RELEASE_IDENTIFIER && env.BUILD_NUMBER
      ? `${appName}@0.0.0-build.${env.BUILD_NUMBER}+commit.${env.RELEASE_IDENTIFIER}`
      : undefined,

  publicWebAddress: env.PUBLIC_WEB_ADDRESS ?? "http://localhost:5173",
  fetchUserAgent: env.FETCH_USER_AGENT ?? "kellertreff/2.0",
  webAuth: {
    callbackUrl: env.WEB_AUTH_CALLBACK_URL,
    clientSecret: env.PR0GRAMM_API_CLIENT_SECRET, // used for login to the frontend, not related to the bot
    clientId: env.PR0GRAMM_API_CLIENT_ID, // used for login to the frontend, not related to the bot (but is the same as for the bot)
  },
  api: {
    port: Number(env.API_PORT ?? "8080"),
    host: env.API_HOST ?? "0.0.0.0",
    cookie: {
      sessionName: "lustige_session",
    },
  },
  service: {},
  sentry: {
    dsn: env.SENTRY_DSN || undefined, // coerce to undefined if empty
    tracesSampleRate: Number(env.SENTRY_TRACES_SAMPLE_RATE ?? "0"),
  },
  debug: {
    enableSessionCreation: nodeEnv !== "production",
    enableDemoData: nodeEnv !== "production",
  },
  databaseUrl: getDatabaseUrl,
  redisUrl: env.REDIS_URL,
  env: nodeEnv,
} as const;

/**
 * Getter because we need to include the config.js on application start,
 * but setting the env var can only be done later in tests.
 */
function getDatabaseUrl() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return env.DATABASE_URL;
}
