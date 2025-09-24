import type { ServerResponse, IncomingMessage, Server } from "node:http";

import type { User } from "../db/model.ts";
import type { UserId } from "../shared/typebox.ts";

declare module "fastify" {
	interface PassportUser extends User {}

	export interface FastifyInstance<
		HttpServer = Server,
		HttpRequest = IncomingMessage,
		HttpResponse = ServerResponse,
	> {
		requiresAuth(req: FastifyRequest): Promise<void>;
		requiresAdmin(req: FastifyRequest): Promise<void>;
		requiresProfile(req: FastifyRequest): Promise<void>;
	}
}
declare module "@fastify/secure-session" {
	interface SessionData {
		passport: UserId;
	}
}
