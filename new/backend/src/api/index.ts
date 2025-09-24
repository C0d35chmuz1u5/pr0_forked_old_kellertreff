import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { serve, type ServerType } from "@hono/node-server";
import { sentry } from "@hono/sentry";
import { setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
// import { logger } from "hono-pino";

// import log from "@/log.js";
import config from "@/config.js";
import { getStatus } from "@db";
import type { User, UserSession } from "@/db/model.js";
import * as session from "./sessionAuth.js";

import { payloads } from "@shared/api-types.js";

import * as userSettingsService from "@/service/userSettings.js";
import * as datingProfileService from "@/service/datingProfile.js";
import * as friendsProfileService from "@/service/friendsProfile.js";
import * as locationService from "@/service/location.js";
import * as debugService from "@/service/debug.js";

//#region Start/Stop

let server: ServerType | undefined = undefined;
export async function startApi() {
  server = serve({
    fetch: app.fetch,
    port: config.api.port,
  });

  await debugService.addDemoData();
}

export async function stopApi() {
  server?.close();
}

//#endregion

type Env = {
  Variables: {
    user: (User & UserSession) | undefined;
  };
};

const app = new Hono<Env>().basePath("/api");

/*
app.use(
    logger({
        pino: log,
    }),
);
*/

app.use(csrf({ origin: new URL(config.publicWebAddress).host }));

app.use("*", sentry());

app.use(session.attachUser);

if (config.debug.enableSessionCreation) {
  app.get("/_dev/session/:userId", async c => {
    const sessionService = await import("@/service/session.js");
    const token = await sessionService.createSession(1, c.req.header("user-agent") ?? "");
    setCookie(c, config.api.cookie.sessionName, token, {
      httpOnly: true,
      sameSite: "lax",
    });
    return c.json({ token });
  });
}

app.get("/", c => c.text("hamlo"));

app.get("/_health", async c => {
  const db = await getStatus();
  return c.json({ status: "ok", version: config.release, db });
});

app.get("/me", async c => {
  const user = c.get("user");

  if (!user) {
    return c.json({ loggedIn: false });
  }

  const setupCompleted =
    !!(await datingProfileService.findForUser(user.id)) ||
    !!(await friendsProfileService.findForUser(user.id));

  return c.json({
    loggedIn: true,
    setupCompleted,
    user: {
      id: user.id,
      name: user.display_name,
      createdAt: user.created_at,
      lastActivity: user.last_used_at,
    },
  });
});

app.get("/account/settings", session.requireUser, async c => {
  // biome-ignore lint/style/noNonNullAssertion: ok
  const user = c.get("user")!;

  const settings = await userSettingsService.findForUser(user.id);
  return c.json({
    dmSpamEnabled: settings.dm_spam_enabled,
    lastChangedAt: settings.updated_at,
  });
});

app.patch(
  "/account/settings",
  session.requireUser,
  zValidator("json", payloads.patch["/account/settings"]),
  async c => {
    const settings = c.req.valid("json");
    const user = c.get("user");

    const newSettings = await userSettingsService.updateForUser(user.id, settings);

    return c.json({
      dmSpamEnabled: newSettings.dm_spam_enabled,
      lastChangedAt: newSettings.updated_at,
    });
  },
);

app.get("/locations", async c => {
  const l = await locationService.getAllLocations();
  return c.json(l);
});
app.get("/dating/interests", async c => {
  const l = await datingProfileService.getAllInterests();
  return c.json(l);
});

//#region /account/profile/dating

app.get("/account/profile/dating", session.requireUser, async c => {
  const user = c.get("user");

  const profile = await datingProfileService.findForUser(user.id);
  if (!profile) {
    return c.json({
      isComplete: false,
      profile: null,
    });
  }

  return c.json({
    isComplete: true,
    profile: {
      enabled: profile.enabled,

      birthday: profile.date_of_birth,
      gender: profile.gender,
      bio: profile.bio,
      currentLocation: profile.current_location_id, // TODO
      lookingFor: profile.looking_for,

      jobTitle: profile.job_title,
      education: profile.education,

      heightCm: profile.height_cm,

      alcoholConsumption: profile.alcohol_consumption,
      smokingHabits: profile.smoking_habits,

      discordId: profile.discord_id,

      interests: profile.interests,
    },
  });
});

app.post(
  "/account/profile/dating",
  session.requireUser,
  zValidator("json", payloads.post["/account/profile/dating"]),
  async c => {
    const user = c.get("user");
    return c.json({ ok: true }); // TODO
  },
);

//#endregion

//#region /account/profile/friends

app.get("/account/profile/friends", session.requireUser, async c => {
  const user = c.get("user");

  const profile = await friendsProfileService.findForUser(user.id);
  if (!profile) {
    return c.json({
      isComplete: false,
      profile: null,
    });
  }

  return c.json({
    isComplete: true,
    profile: {
      enabled: profile.enabled,
      bio: profile.bio,
      interests: profile.interests,
    },
  });
});

app.post(
  "/account/profile/friends",
  session.requireUser,
  zValidator("json", payloads.post["/account/profile/friends"]),
  async c => {
    const user = c.get("user");

    const profile = c.req.valid("json");

    const newProfile = await friendsProfileService.updateProfile(
      user.id,
      profile.enabled,
      profile.bio,
      profile.interests,
    );

    return c.json({
      isComplete: true,
      profile: {
        enabled: newProfile.enabled,
        bio: newProfile.bio,
        interests: newProfile.interests,
      },
    });
  },
);

//#endregion
