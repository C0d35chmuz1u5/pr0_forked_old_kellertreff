import * as sentry from "@sentry/node";

import config from "./config.js";

export function initSentry() {
	sentry.init({
		dsn: config.sentry.dsn,
	});
}
