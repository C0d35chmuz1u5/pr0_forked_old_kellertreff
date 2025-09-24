import type { GeneratedAlways, Selectable, Kysely, Generated } from "kysely";
import type {
	ApiAccessToken,
	Pr0grammIdentifier,
	UserId,
	UserName,
	UserText,
	CountryCode,
	ZipCode,
	TagList,
} from "../shared/typebox.js";
import type { DBBool } from "./db-types.js";

type HasDefault<T> = Generated<T>;

export interface Database {
	user: UserTable;
	tag_assignment: TagAssignmentTable;
	/**
	 * View on user table with all columns.
	 */
	complete_profile: UserTable;
	geo_location: GeoLocationTable;
	vote: VoteTable;

	user_notification: UserNotificationTable;
	spam_notification: SpamNotificationTable;

	user_with_outstanding_upvotes: UserWithOutstandingUpVotesView;

	banned_user: BannedUserTable;
}

export type KtDatabase = Kysely<Database>;

export interface AuditedTable {
	created_at: GeneratedAlways<Date>;
	updated_at: GeneratedAlways<Date>;
}

export type User = Selectable<UserTable>; // TODO: Make this a union of registered and unregistered users
export interface UserTable extends AuditedTable {
	id: GeneratedAlways<UserId>;
	display_name: UserName;

	api_access_token: ApiAccessToken | null;
	identifier: Pr0grammIdentifier | null;

	current_text: HasDefault<UserText>;

	score: HasDefault<number>;
	update_count: HasDefault<number>;
	wants_spam: HasDefault<number>;
	last_activity: GeneratedAlways<Date>;

	country_code: HasDefault<CountryCode | null>;
	zip_code: HasDefault<ZipCode | null>;

	session_level: HasDefault<number>;
}

export type TagAssignmentId = number;

export type TagAssignment = Selectable<TagAssignmentTable>;
export interface TagAssignmentTable {
	id: GeneratedAlways<TagAssignmentId>;
	user: UserId;
	tag: string;
	created_at: GeneratedAlways<Date>;
}

export type GeoLocation = Selectable<GeoLocationTable>;
export interface GeoLocationTable {
	country_code: CountryCode;
	zip_code: ZipCode;
	latitude: number;
	longitude: number;
}

export type Vote = Selectable<VoteTable>;
export interface VoteTable extends AuditedTable {
	user: UserId;
	candidate: UserId;

	decision: DBBool;
	candidate_text: string;
}

export type UserNotification = Selectable<UserNotificationTable>;
export interface UserNotificationTable extends AuditedTable {
	user: UserId;
	partner: UserId;

	sent: DBBool;
}

export interface SpamNotificationTable extends AuditedTable {
	user: UserId;
	amount: number;
}

export interface UserWithOutstandingUpVotesView {
	user: GeneratedAlways<UserId>;
	display_name: GeneratedAlways<UserName>;
	last_activity: GeneratedAlways<Date>;
	outstanding_upvotes: GeneratedAlways<number>;
}

export interface BannedUserTable extends AuditedTable {
	id: GeneratedAlways<number>;
	pr0gramm_id_hash: string;
}
