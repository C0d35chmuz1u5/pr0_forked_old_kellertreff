import { Value } from "@sinclair/typebox/value";
import { type Static, type TSchema, Type } from "@fastify/type-provider-typebox";

import {
	MIN_USER_TEXT_LENGTH,
	MAX_USER_TEXT_LENGTH,
	MIN_TAG_LENGTH_INCLUSIVE,
	MAX_TAG_LENGTH_INCLUSIVE,
	MIN_TAG_COUNT,
	MAX_TAG_COUNT,
} from "./constants.js";

//#region Branding

/** Ref: https://spin.atomicobject.com/2018/01/15/typescript-flexible-nominal-typing/ */
type Brand<TBrand> = {
	_type: TBrand;
};

export type Nominal<T, TBrand> = T & Brand<TBrand>;

//#endregion

export const NullableType = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

export const UserTextType = Type.String({
	minLength: MIN_USER_TEXT_LENGTH,
	maxLength: MAX_USER_TEXT_LENGTH,
});
export type UserText = Nominal<Static<typeof UserTextType>, "UserText">;

export const UserNameType = Type.String({ minLength: 2, maxLength: 32 });
export type UserName = Nominal<Static<typeof UserNameType>, "UserName">;

export const UserIdType = Type.Integer({ minimum: 0 });
export type UserId = Nominal<Static<typeof UserIdType>, "UserId">;

/**
 * No assertion/validation function for TagList because it is an internal representation.
 * It should always be created via createTagListFromTags.
 */
export type TagList = Nominal<string, "TagList">;

export const UserTagType = Type.String({
	minLength: MIN_TAG_LENGTH_INCLUSIVE,
	maxLength: MAX_TAG_LENGTH_INCLUSIVE,
});
export type UserTag = Nominal<Static<typeof UserTagType>, "UserTag">;

export const UserTagSetType = Type.Array(UserTagType, {
	minItems: MIN_TAG_COUNT,
	maxItems: MAX_TAG_COUNT,
});
export type UserTagSet = Nominal<Static<typeof UserTagSetType>, "UserTagSet">;

export const CountryCodeType = Type.Union([
	Type.Literal("DE"),
	Type.Literal("AT"),
	Type.Literal("CH"),
]);
export type CountryCode = Nominal<Static<typeof CountryCodeType>, "CountryCode">;

/** @remarks `Type.RegExp(/^[0-9]{4,5}$/i);` seems bugged in fastify */
export const ZipCodeType = Type.String({
	pattern: "^[0-9]{4,5}$",
});
export type ZipCode = Nominal<Static<typeof ZipCodeType>, "ZipCode">;

export const GeoLocationType = Type.Object({
	countryCode: CountryCodeType,
	zipCode: ZipCodeType,
});

export type GeoLocation = Nominal<Static<typeof GeoLocationType>, "GeoLocation">;

export const ApiAccessTokenType = Type.RegExp(/^[0-9a-z-_]{2,100}$/i);
export type ApiAccessToken = Nominal<Static<typeof ApiAccessTokenType>, "ApiAccessToken">;

export const Pr0grammIdentifierType = Type.RegExp(/^[0-9a-f-A-F]{32}$/i);
export type Pr0grammIdentifier = Nominal<
	Static<typeof Pr0grammIdentifierType>,
	"Pr0grammIdentifier"
>;

/** Used for banning */
export type HashedName = Nominal<string, "HashedName">;

export function assertValue<TName extends string, Type extends TSchema>(
	type: Type,
	_: TName,
	value: unknown,
): asserts value is Nominal<Static<Type>, TName> {
	if (!Value.Check(type, value)) {
		throw new Error(`Expected ${type.displayName}, got ${value}`);
	}
}
