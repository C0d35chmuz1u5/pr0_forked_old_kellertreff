import {
	MIN_USER_TEXT_LENGTH,
	MAX_USER_TEXT_LENGTH,
	MIN_TAG_LENGTH_INCLUSIVE,
	MAX_TAG_LENGTH_INCLUSIVE,
	MIN_TAG_COUNT,
	MAX_TAG_COUNT,
} from "./constants.js";
import type {
	CountryCode,
	GeoLocation,
	UserTag,
	UserTagSet,
	UserText,
	ZipCode,
	TagList,
} from "./typebox.js";

export class TypeAssertionError extends Error {
	static displayName = "TypeAssertion";
	name = TypeAssertionError.displayName;

	constructor(typeName: string, actualValue: unknown) {
		super(`Value should be a valid ${typeName}, but it was ${actualValue}`);
	}
}

export function isUserText(value: unknown): value is UserText {
	if (typeof value === "string" && value !== "") {
		const trimmed = value.trim();
		return MIN_USER_TEXT_LENGTH <= trimmed.length && trimmed.length < MAX_USER_TEXT_LENGTH;
	}
	return false;
}
export function assertUserText(value: unknown): asserts value is UserText {
	if (!isUserText(value)) throw new TypeAssertionError("UserText", value);
}

export function isTags(value: unknown): value is UserTagSet {
	return (
		typeof value !== "undefined" &&
		Array.isArray(value) &&
		value.length >= MIN_TAG_COUNT &&
		value.length <= MAX_TAG_COUNT &&
		value.every(isTag)
	);
}
export function assertTags(value: unknown): asserts value is UserTagSet {
	if (!isTags(value)) throw new TypeAssertionError("Tag[]", value);
}

export function isTag(value: unknown): value is UserTag {
	return (
		!!value &&
		typeof value === "string" &&
		value.trim().length >= MIN_TAG_LENGTH_INCLUSIVE &&
		value.length <= MAX_TAG_LENGTH_INCLUSIVE &&
		!(
			value.includes(",") ||
			value.includes("_") ||
			value.includes("\n") ||
			value.includes("\r")
		)
	);
}

/**
 * We use arrays (instead of ES6 sets) because it is easier to handle at our scale (we typically have liek 6 entries).
 */
export function getTagsFromTagList(value: TagList, lowerCase: boolean): UserTagSet {
	if (!value) {
		return [] as unknown as UserTagSet;
	}

	const tags = value
		.split(",")
		.map(t => normalizeTagString(lowerCase, t) as UserTag)
		.filter(isTag);

	// Note that, unlike in python, ES6 sets are iterated in insertion order, so this code preserves the order of the original array.
	// Ref: https://stackoverflow.com/a/9229821
	return [...new Set<UserTag>(tags)] as unknown as UserTagSet;
}

export function createTagListFromTags(value: UserTagSet): TagList {
	return value
		.map(t => normalizeTagString(false, t))
		.filter(isTag) // just as a sanity check here
		.join(",") as TagList;
}

function normalizeTagString(lowerCase: boolean, value: string): string {
	if (!value) return "";

	const normalized = value.replace(/\r|\n/g, "").replace(/_/g, " ");

	return lowerCase ? normalized.trim().toLowerCase() : normalized.trim();
}

const zipCodePattern = /^[0-9]{4,5}$/i;
export function isZipCode(value: unknown): value is ZipCode {
	return !!value && typeof value === "string" && zipCodePattern.test(value);
}

export function isCountryCode(value: unknown): value is CountryCode {
	return (
		!!value && typeof value === "string" && (value === "DE" || value === "AT" || value === "CH")
	);
}

export function isGeoLocation(value: unknown): value is GeoLocation {
	return (
		!!value &&
		typeof value === "object" &&
		value !== null &&
		"countryCode" in value &&
		"zipCode" in value &&
		isCountryCode(value.countryCode) &&
		isZipCode(value.zipCode)
	);
}
export function assertGeoLocation(value: unknown): asserts value is GeoLocation {
	if (!isGeoLocation(value)) throw new TypeAssertionError("GeoLocation", value);
}
