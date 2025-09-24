import errors from "http-errors";
import type { FastifyRequest } from "fastify";

import type { User } from "../db/model.js";

export default function assertUser<T extends FastifyRequest>(
	req: T,
): asserts req is T & { user: User } {
	if (!req.user) {
		throw new errors.Forbidden("User is not authenticated");
	}
}
