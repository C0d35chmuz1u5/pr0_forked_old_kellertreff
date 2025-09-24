const env = process.env;

export default {
	dryMode: env.ENABLE_DRY_MODE?.toLowerCase() === "true",
	sentry: {
		dsn: env.SENTRY_DSN,
	},
	pr0gramm: {
		apiBase:
			process.env.NODE_ENV === "production"
				? undefined
				: process.env.PR0GRAMM_API_BASE ?? "http://localhost:9090/api",

		user: process.env.PR0GRAMM_NOTIFICATION_BOT_USER,
		password: process.env.PR0GRAMM_NOTIFICATION_BOT_PASSWORD,
	},
};
