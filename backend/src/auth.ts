import type { FastifyRequest, FastifyInstance } from "fastify";
import { Type } from "@fastify/type-provider-typebox";
import fastifyAuth from "@fastify/auth";
import { Authenticator } from "@fastify/passport";
import fastifySecureSession from "@fastify/secure-session";
import csrfProtection from "@fastify/csrf-protection";
import fp from "fastify-plugin";
import errors from "http-errors";

import { Strategy as Pr0grammStrategy } from "passport-pr0gramm";

import config from "./config.js";
import * as userService from "./service/user.js";
import type { User } from "./db/model.js";
import {
	type ApiAccessToken,
	type Pr0grammIdentifier,
	type UserId,
	UserIdType,
	type UserName,
} from "./shared/typebox.js";

export default fp(async function routes(server: FastifyInstance) {
	const fastifyPassport = new Authenticator();

	fastifyPassport.registerUserSerializer(async (user: User) => user.id);
	fastifyPassport.registerUserDeserializer(async id => {
		if (typeof id !== "number") {
			throw "pass"; // Actual way to tell passport to skip this deserializer
		}
		return userService.findById(id as UserId);
	});

	// Ref:
	// https://www.npmjs.com/package/@fastify/passport
	// https://www.youtube.com/watch?v=XRcQQWU0XOM
	server.register(fastifySecureSession, {
		key: Buffer.from(config.api.sessionSecret, "ascii"),
		cookie: {
			path: "/",
		},
	});
	server.register(fastifyPassport.initialize());
	server.register(fastifyPassport.secureSession());

	fastifyPassport.use(
		"pr0gramm",
		new Pr0grammStrategy(
			{
				clientID: config.pr0gramm.clientId,
				clientSecret: config.pr0gramm.clientSecret,
				callbackURL: `${config.pr0gramm.loginRedirectUrlBase}/api/auth/pr0gramm/callback`,
			},
			(accessToken, refreshToken, profile, cb) => {
				const userName = profile.name;
				const identifier = profile.id;

				// assertValue(ApiAccessTokenType, "ApiAccessToken", accessToken);
				// assertValue(UserNameType, "UserName", userName);
				// assertValue(
				//     Pr0grammIdentifierType,
				//     "Pr0grammIdentifier",
				//     identifier,
				// );

				userService
					.createOrUpdateUser(
						accessToken as ApiAccessToken,
						refreshToken,
						identifier as Pr0grammIdentifier,
						userName as UserName,
					)
					.then(
						user => cb(null, user),
						err => cb(err, undefined),
					);
			},
		),
	);

	server.decorate("requiresAuth", async (req: FastifyRequest) => {
		if (!req.user) {
			throw new errors.Forbidden();
		}
		// We abuse the session cookie as a CSRF token
		// This is kinda valid in our case, since the session cookie is encrypted, and therefore random
		const session = req.cookies.session;
		if (!session || session.length < 32) {
			throw new errors.Forbidden();
		}
	});

	server.decorate("requiresAdmin", async (req: FastifyRequest) => {
		if (!req.user) {
			throw new errors.Forbidden();
		}
		if (req.user.id !== 1) {
			throw new errors.Unauthorized();
		}
	});

	server.decorate("requiresProfile", async (req: FastifyRequest) => {
		if (!req.user) {
			throw new errors.Forbidden();
		}
		if (!(await userService.hasCompletedProfileSetup(req.user))) {
			throw new errors.Unauthorized("mustCompleteProfile");
		}
	});

	server.register(fastifyAuth);
	server.register(csrfProtection, {
		sessionPlugin: "@fastify/secure-session",
	});

	server.get("/api/auth/logout", async (req, res) => {
		req.logOut();
		res.redirect("/");
	});
	server.get("/api/auth/login", fastifyPassport.authenticate("pr0gramm"));
	server.get(
		"/api/auth/pr0gramm/callback",
		{
			preValidation: fastifyPassport.authenticate("pr0gramm"),
		},
		(_, res) => res.redirect(config.publicUrl),
	);

	if (process.env.NODE_ENV !== "production") {
		server.get(
			"/api/session/:userId",
			{
				schema: {
					params: Type.Object({
						userId: UserIdType,
					}),
				},
			},
			async (req, res) => {
				if (process.env.NODE_ENV === "production") {
					throw new errors.NotFound();
				}

				const userId = (req.params as unknown as { userId: UserId }).userId;

				const user = await userService.findById(userId);
				if (!user) {
					throw new errors.NotFound();
				}

				req.session.set("passport", user.id);
				res.send({});
			},
		);
	}
});
