import type {
  AlcoholConsumption,
  CountryCode,
  Gender,
  RelationshipSearchType,
  SmokingHabits,
} from "@shared/api-types.js";
import type { ColumnType, GeneratedAlways, Selectable } from "kysely";

export interface Database {
  user: UserTable;
  user_session: UserSessionTable;
  banned_user: BannedUserTable;
  geo_location: GeoLocationTable;
  user_settings: UserSettingsTable;
  user_filter: UserFilterTable;
  user_dating_profile: UserDatingProfileTable;
  interest: InterestTable;
  user_dating_profile_interest: UserDatingProfileInterestTable;
  user_friends_profile: UserFriendsProfileTable;
  user_friends_interest: FriendsInterestTable;
  user_report: UserReportTable;
}

export type UserId = number;

export interface AuditedTable {
  created_at: GeneratedAlways<Date>;
  updated_at: GeneratedAlways<Date>;
}

export type ExternalIdentifier = string;
export type ApiAccessToken = string;

export type User = Selectable<UserTable>;
export interface UserTable extends AuditedTable {
  id: GeneratedAlways<UserId>;
  display_name: string; // unique
  auth_api_access_token: ApiAccessToken;
  external_id: ExternalIdentifier;
}

export type SessionToken = string;

export type UserSession = Selectable<UserSessionTable>;
export interface UserSessionTable extends AuditedTable {
  id: GeneratedAlways<number>;
  user_id: UserId;
  user_agent: string;
  last_used_at: ColumnType<Date, never, Date>;
  token: SessionToken; // unique
  // expires_at: Date;
}

export type Sha256Hash = string;

export type BannedUser = Selectable<BannedUserTable>;
export interface BannedUserTable extends AuditedTable {
  id: GeneratedAlways<number>;
  external_id_hash: Sha256Hash; // unique
  reason: string | null;
}

export type GeoLocation = Selectable<GeoLocationTable>;
export interface GeoLocationTable {
  id: GeneratedAlways<number>;
  country_code: CountryCode; // (country_code, zip_code) is unique
  zip_code: string;
  latitude: number;
  longitude: number;
}

export type UserSettings = Selectable<UserSettingsTable>;
export interface UserSettingsTable extends AuditedTable {
  id: GeneratedAlways<number>;
  user_id: ColumnType<UserId, UserId, never>; // unique
  dm_spam_enabled: ColumnType<boolean, boolean | undefined, boolean>;
}

export type UserFilter = Selectable<UserFilterTable>;
export interface UserFilterTable extends AuditedTable {
  id: GeneratedAlways<number>;
  user_id: ColumnType<UserId, UserId, never>; // unique
  age_range_min: number | null; // unsigned
  age_range_max: number | null; // unsigned
  distance_max: number | null; // unsigned

  accepts_male: boolean;
  accepts_female: boolean;
  accepts_other: boolean;
}

export type UserDatingProfile = Selectable<UserDatingProfileTable>;
export interface UserDatingProfileTable extends AuditedTable {
  id: GeneratedAlways<number>;
  user_id: ColumnType<UserId, UserId, never>;

  enabled: boolean;

  /** Not displayed, used for age */
  date_of_birth: Date;
  // age: GeneratedAlways<number>;
  gender: Gender;
  bio: string;
  current_location_id: GeoLocationTable["id"];

  looking_for: RelationshipSearchType;

  job_title: string | null;
  education: string | null;

  height_cm: number | null;

  alcohol_consumption: AlcoholConsumption | null;
  smoking_habits: SmokingHabits | null;

  /** Only visible after match */
  discord_id: string | null;

  // Maybe later:
  // weed_consumption;
  // myers-briggs
  // home_location_id: GeoLocationTable["id"] | null;
  // star_sign
  // sport_frequency

  // TODO later:
  // profile_questions
  // most_important_interest
  // partner_features
  // languages
  // political_views
  // religion
  // pets
  // children
  // relationship_status (open/monogamous/polyamorous/...)
  // initiatives and communities
  // "looks"? (hair color, eye color, body type, tattoos, piercings, etc.)
}

export type InterestId = number;
export type Interest = Selectable<InterestTable>;
export interface InterestTable extends AuditedTable {
  id: GeneratedAlways<InterestId>;
  // TODO: Icon?
  name: string; // unique
}

export type UserDatingProfileInterest = Selectable<UserDatingProfileInterestTable>;
export interface UserDatingProfileInterestTable extends AuditedTable {
  id: GeneratedAlways<number>;
  profile_id: UserDatingProfileTable["id"];
  interest_id: InterestTable["id"];
  priority: number;
}

export type UserFriendsProfile = Selectable<UserFriendsProfileTable>;
export interface UserFriendsProfileTable extends AuditedTable {
  id: GeneratedAlways<number>;
  user_id: ColumnType<UserId, UserId, never>;
  enabled: boolean;
  // TODO:
  // looking_for_tags: string[];
  bio: string;
}

export type FriendsInterest = Selectable<FriendsInterestTable>;
export interface FriendsInterestTable extends AuditedTable {
  id: GeneratedAlways<number>;
  profile_id: UserFriendsProfileTable["id"];
  priority: number;
  content: string;
}

export type UserReport = Selectable<UserReportTable>;
export interface UserReportTable extends AuditedTable {
  id: GeneratedAlways<number>;
  reporter_id: UserId;
  reported_user_id: UserId;
  reason: string;
  // internal_comment: string;
  closed_at: ColumnType<Date, never, Date>;
}
