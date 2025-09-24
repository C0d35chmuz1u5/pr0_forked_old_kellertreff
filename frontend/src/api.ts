import { API_BASE } from "./client-constants";
import type { KTSession } from "./types";

export * from "@/shared/types";
export * from "@/shared/api-types";

// TODO: Log out if API returned 401

// TODO: Make this prettier
export function apiFetch<T>(
	endpoint: string,
	session: KTSession | undefined,
	options: {
		method: RequestInit["method"];
		body: T | undefined;
	},
): ReturnType<typeof fetch> {
	const url = API_BASE + endpoint;
	const body = options.body ? JSON.stringify(options.body) : undefined;
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (session?.token) {
		headers["X-CSRF-Token"] = session.token;
	}

	return fetch(url, {
		method: options.method,
		body,
		headers,
	}).then(session && logOutIfUnauthorized(session));
}

export function logOutIfUnauthorized(session: KTSession): (response: Response) => Response {
	return (response: Response): Response => {
		if (response.status === 401) {
			session.logOut();
		}
		return response;
	};
}
