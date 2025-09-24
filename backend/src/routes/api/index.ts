import type { ServerInstance } from "../../server.js";
import { ok } from "../../api-helper.js";
import * as spatial from "../../spatial.js";
import * as userService from "../../service/user.js";

export default async function routes(server: ServerInstance) {
	/** This endpoint should not cause database load, as it is called by the monitoring system once a minute. */
	server.get("/monitor", async (_req, res) => {
		res.send(ok());
	});

	/** Endpoint for service monitoring to determine if the service is ready/ok */
	server.get("/monitor/health", async (_req, res) => {
		res.send(ok());
	});

	server.get("/locations", async (_req, res) => {
		res.send(
			ok({
				locations: spatial.locations,
				shorts: spatial.statesShort,
			}),
		);
	});

	server.get("/me", async (req, res) => {
		const user = req.user;
		if (!user) {
			res.send(ok({ loggedIn: false, user: null }));
			return;
		}

		const token = res.generateCsrf();

		res.send(
			ok({
				loggedIn: true,
				user: {
					id: user.id,
					displayName: user.display_name,
				},
				token,
				profileCompleted: await userService.hasCompletedProfileSetup(user),
			}),
		);
	});
}
