export type Timestamp = string;
export type DBBool = 0 | 1;

export function asSQLiteBoolean(value: boolean): DBBool {
	return value ? 1 : 0;
}
export function fromSQLiteBoolean(value: DBBool): boolean {
	return !!value;
}

export type ParsedEntity<T, TTs extends keyof T> = {
	[K in keyof T]: K extends TTs ? Date : T[K];
};

export function parseTimestamps<T, TS extends (keyof T)[]>(
	obj: undefined,
	...timestampFields: [...TS]
): undefined;
export function parseTimestamps<T, TS extends (keyof T)[]>(
	obj: null,
	...timestampFields: [...TS]
): null;
export function parseTimestamps<T, TS extends (keyof T)[]>(
	obj: T,
	...timestampFields: [...TS]
): ParsedEntity<T, TS[number]> & { created_at: Date; modified_at: Date }; // TODO: Remove modified_at when not existing on T
export function parseTimestamps<T, TS extends (keyof T)[]>(
	obj: T | null | undefined,
	...timestampFields: [...TS]
): ParsedEntity<T, TS[number]> | null | undefined {
	if (obj === undefined) return undefined;

	if (obj === null) return null;

	// biome-ignore lint/suspicious/noExplicitAny: doing this in TS types is way more complicated
	const res: any = { ...obj };

	if ("modified_at" in res) {
		res.modified_at = parseDate(res.modified_at);
	}

	if ("created_at" in res) {
		res.created_at = parseDate(res.created_at);
	}

	for (const field of timestampFields) {
		const tsValue = obj[field];
		if (typeof tsValue === "string" || typeof tsValue === "number") {
			res[field] = parseDate(tsValue);
		}
	}
	return res;
}

function parseDate(v: string | number): Date {
	if (typeof v === "number") return new Date(v);

	// The '+ "Z"' is a dirty hack to get SQLite's timestamps "2021-07-25 19:07:53" (which are UTC/GMT) to be parsed as UTC.
	// otherwise, JS assumes that it's local time
	// We should evaluate the temporal API to address this issue as soon as it's stable
	const utcDateString = v.endsWith("Z") ? v : `${v}Z`;
	return new Date(utcDateString);
}
