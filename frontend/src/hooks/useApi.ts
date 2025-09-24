import useSWR from "swr";
import type { SWRResponse } from "swr";

import type { EndpointLookup } from "@/api";
import type { KTSession } from "@/types";
import { API_BASE } from "@/client-constants";

export default function useApi<T extends keyof EndpointLookup>(
	endpoint: T,
	session: KTSession | undefined,
): SWRResponse<EndpointLookup[T], Error> {
	return useSWR([endpoint, session?.token], ([url, token]) => fetcher(url, token));
}
// Taken from the docs: https://swr.vercel.app/docs/error-handling
const fetcher = async (endpoint: string, token: string | undefined) => {
	const fullUrl = API_BASE + endpoint;

	const response = await fetch(fullUrl, {
		headers: token ? { "X-CSRF-Token": token } : {},
	});
	if (!response.ok) {
		throw new Error("An error occurred while fetching the data.");
	}
	const res = await response.json();
	if (!res.success) {
		throw new Error("Lol 1 fehler :(");
	}
	return res.data;
};
