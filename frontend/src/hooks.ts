import { useSessionStorage } from "react-use";

import { apiFetch, type LocationHintData } from "./api";

// TODO: Log out if API returned 401

export function useLocationHintData(): LocationHintData {
	const [locationHints, setLocations] = useSessionStorage<LocationHintData>("locationHintData", {
		locations: [],
		shorts: [],
	});

	if (!locationHints || locationHints.locations.length === 0) {
		apiFetch("/locations", undefined, { method: "get", body: undefined })
			.then(r => r.json())
			.then(res => res.data && setLocations(res.data));
	}

	return locationHints;
}
