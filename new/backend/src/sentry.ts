import * as sentry from "@sentry/node";

import config from "./config.js";

export async function initSentry() {
  const s = config.sentry;
  if (!s.dsn) {
    return;
  }

  sentry.init({
    dsn: s.dsn,
    environment: config.env,
    release: config.release,
    tracesSampleRate: s.tracesSampleRate,
  });
}
