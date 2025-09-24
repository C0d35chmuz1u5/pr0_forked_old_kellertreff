import { z } from "zod";

export enum CountryCode {
  DE = "DE",
  AT = "AT",
  CH = "CH",
}

export enum Gender {
  Male = "M",
  Female = "F",
  Other = "O",
}

export enum AlcoholConsumption {
  Never = "never",
  Socially = "socially",
  Often = "often",
  Daily = "daily",
}

export enum SmokingHabits {
  Never = "never",
  Socially = "socially",
  Often = "often",
  Daily = "daily",
  Quit = "quit",
  WhileDrinking = "while_drinking",
}

export enum RelationshipSearchType {
  NotSure = "not_sure",
  CasualDating = "casual_dating",
  Hookup = "hookup",
  Relationship = "relationship",
  Marriage = "marriage",
}

const friendsInterest = z.string().min(2).max(32);

const bio = z.string().min(2).max(1024);
const heightCm = z.number().positive().min(50).max(250);
const discordName = z
  .string()
  .min(2)
  .max(32)
  .regex(/^[a-zA-Z0-9\._\-#]+$/);

// validation for backend
export const payloads = {
  patch: {
    "/account/settings": z.object({
      dmSpamEnabled: z.boolean(),
    }),
  },
  post: {
    "/account/profile/dating": z.object({
      enabled: z.boolean(),

      birthday: z.string().date(),
      gender: z.nativeEnum(Gender),
      bio,

      currentLocation: z.number(),
      lookingFor: z.nativeEnum(RelationshipSearchType),

      jobTitle: z.string().nullable(),
      education: z.string().nullable(),

      heightCm: heightCm.nullable(),

      alcoholConsumption: z.nativeEnum(AlcoholConsumption).nullable(),
      smokingHabits: z.nativeEnum(SmokingHabits).nullable(),

      discordId: discordName.nullable(),

      interests: z.array(z.number()),
    }),
    "/account/profile/friends": z.object({
      enabled: z.boolean(),

      bio,
      interests: z.array(friendsInterest),
    }),
  },
};

// types for frontend
export interface ApiPayload {
  patch: {
    "/account/settings": z.infer<(typeof payloads.patch)["/account/settings"]>;
  };
  post: {
    "/account/profile/dating": z.infer<(typeof payloads.post)["/account/profile/dating"]>;
    "/account/profile/friends": z.infer<(typeof payloads.post)["/account/profile/friends"]>;
  };
  get: {
    "/me": undefined;
    "/locations": undefined;
    "/dating/interests": undefined;
    "/account/settings": undefined;
    "/account/profile/dating": undefined;
    "/account/profile/friends": undefined;
  };
}

export const responses = {
  get: {
    "/me": z.union([
      z.object({
        loggedIn: z.literal(false),
      }),
      z.object({
        loggedIn: z.literal(true),
        setupCompleted: z.boolean(),
        user: z.object({
          id: z.number(),
          name: z.string(),
          createdAt: z.date(),
          lastActivity: z.date(),
        }),
      }),
    ]),
    "/locations": z.record(
      z.nativeEnum(CountryCode),
      z.object({
        id: z.number(),
        zipCode: z.string(),
      }),
    ),
    "/dating/interests": z.array(z.object({ id: z.number(), name: z.string() })),
    "/account/settings": z.object({
      dmSpamEnabled: z.boolean(),
      lastChangedAt: z.string().date(),
    }),
    "/account/profile/dating": z.union([
      z.object({
        isComplete: z.literal(false),
        profile: z.literal(null),
      }),
      z.object({
        // TODO
      }),
    ]),
    "/account/profile/friends": z.union([
      z.object({
        isComplete: z.literal(false),
        profile: z.literal(null),
      }),
      z.object({
        isComplete: z.literal(true),
        profile: z.object({
          enabled: z.boolean(),
          bio,
          interests: z.array(
            z.object({
              id: z.number(),
              content: friendsInterest,
            }),
          ),
        }),
      }),
    ]),
  },
};

export interface ApiResponse {
  get: {
    "/me": z.infer<(typeof responses.get)["/me"]>;
    "/locations": z.infer<(typeof responses.get)["/locations"]>;
    "/dating/interests": z.infer<(typeof responses.get)["/dating/interests"]>;
    "/account/settings": z.infer<(typeof responses.get)["/account/settings"]>;
    "/account/profile/dating": z.infer<(typeof responses.get)["/account/profile/dating"]>;
    "/account/profile/friends": z.infer<(typeof responses.get)["/account/profile/friends"]>;
  };
}
