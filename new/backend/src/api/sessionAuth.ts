import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

import type { User, UserSession } from "@/db/model.js";
import * as sessionService from "@/service/session.js";
import log from "@/log.js";
import config from "@/config.js";

export const attachUser: MiddlewareHandler = async (c, next) => {
  const session = getCookie(c, config.api.cookie.sessionName);
  if (!session) {
    await next();
    return;
  }

  const user = await sessionService.findUser(session);
  if (!user) {
    await next();
    return;
  }

  c.set("user", user);

  await next();
};

type RequireUserEnv = {
  Variables: {
    user: User & UserSession;
  };
};

export const requireUser: MiddlewareHandler<RequireUserEnv> = async (c, next) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, {
      res: new Response("Unauthorized", {
        status: 401,
      }),
    });
  }

  // Not awaiting session use
  sessionService
    .logUse(user.token, c.req.header("user-agent") ?? "", new Date())
    .catch(err => log.error(err, "Failed to log session use"));
  await next();
};
