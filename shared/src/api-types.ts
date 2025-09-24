import type {
	UserId,
	UserName,
	UserText,
	GeoLocation,
	CountryCode,
	UserTagSet,
} from "./typebox.js";

export type ServerResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface SuccessResponse<T> {
	success: true;
	// rt: number;
	data: T;
}

export interface ErrorResponse {
	success: false;
	// rt: number;
	name: string;
	message: string;
}

export interface EndpointLookup {
	"/account/settings": SettingsResponse;
	"/account/profile": ProfileInfo;
	"/account/profile/stats": ProfileStats;

	"/vote": VoteOfUser[];
	"/vote/match": MatchedVote[];
	"/vote/pending": PendingVote[];
	"/admin/stats": Stats;
	"/admin/info": {
		bannedUsers: number;
	};
	"/locations": LocationHintData;
}

export interface LocationHintData {
	locations: readonly string[];
	shorts: readonly string[];
}

export interface SettingsResponse {
	id: UserId;
	name: UserName;
	wantsNotifications: boolean;
	mustCompleteProfile: boolean;
}

export interface ProfileInfo {
	id: UserId;
	name: UserName;
	currentText: UserText | "";
	tags: UserTagSet;
	mustCompleteProfile: boolean;
	location: GeoLocation | null;
	// editsRemaining: number;
	// matches: number;
	// votes: number;
	registered: string;
}

export interface NotificationPreferences {
	wantsNotifications: boolean;
}

export interface ProfileStats {
	id: UserId;
	name: UserName;
	currentText: UserText | "";
	// tags: UserTagSet;
	score: number;
	wantsNotifications: boolean;
}

export interface VoteOfUser {
	partnerId: UserId;
	text: UserText;
	tags: UserTagSet;
	decision: boolean;
	votedAt: Date;
}

export interface MatchedVote {
	partnerId: UserId;
	partnerName: UserName;
	partnerText: UserText;
	partnerTags: UserTagSet;
	matchedAt: string;
}

export interface PendingVote {
	userId: UserId;
	currentText: UserText;
	tags: UserTagSet;
	distance: string;
}

export type VoteResult = MatchedVote | null;

export interface Stats {
	lastVote: string | Date;
	lastRegistration: string | Date;
	users: number;
	usersWithNotificationsEnabled: number;
	notificationsPending: number;
	sentNotifications: number;
	completeProfiles: number;
	totalVotes: number;
	totalMatches: number;
	votesOfToday: {
		up: number;
		down: number;
	};
	countryStats: LocationStatEntry[];
}

export interface LocationStatEntry {
	countryCode: CountryCode;
	users: number;
}

export type MonitorData = Record<string, unknown>;
