import { fileURLToPath } from "node:url";
import { dirname, join as joinPath } from "node:path";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { fastify } from "fastify";
import cors from "@fastify/cors";
import autoload from "@fastify/autoload";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import auth from "./auth.js";
import config from "./config.js";
import logger from "./log.js";

export const server = fastify({
	loggerInstance: logger,
}).withTypeProvider<TypeBoxTypeProvider>();

export type ServerInstance = typeof server;

server.register(cors, {
	origin: "https://kellertreff.com",
	credentials: true,
	allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
});

server.register(auth);

//#region Swagger

server.register(swagger, {
	mode: "dynamic",
	prefix: "/docs",
	openapi: {
		info: {
			title: "Kellertreff API",
			version: "0.1.0",
		},
	},
});

server.register(swaggerUi, {
	routePrefix: "/docs",
	uiConfig: {
		docExpansion: "full",
		deepLinking: false,
	},
});

//#endregion

server.register(autoload, {
	dir: joinPath(dirname(fileURLToPath(import.meta.url)), "routes"),
});

export async function startServer() {
	await server.listen({
		port: config.api.port,
		host: config.api.host,
	});
	await server.ready();
}

export async function stopServer() {
	logger.info("Stopping API server...");
	await server.close();
}
