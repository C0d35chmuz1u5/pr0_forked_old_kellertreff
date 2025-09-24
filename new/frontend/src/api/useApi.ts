import useSWR from "swr/immutable";
import type { SWRResponse } from "swr";

import type { ApiResponse, ApiPayload } from "@shared/api-types";

const swrOptions = { revalidateOnMount: true } as const;

export default function useApi<T extends keyof ApiResponse["get"]>(
  endpoint: T,
): SWRResponse<ApiResponse["get"][T], unknown>;

export default function useApi<T extends keyof ApiResponse["get"]>(
  endpoint: T,
  query: ApiPayload["get"][T],
): SWRResponse<ApiResponse["get"][T], unknown>;

export default function useApi<T extends keyof ApiResponse["get"]>(
  endpoint: T,
  query?: Record<string, unknown>,
): SWRResponse<ApiResponse["get"][T], unknown> {
  const searchParams = query ? `?${getQueryString(query)}` : "";
  return useSWR(`/api${endpoint}${searchParams}`, swrOptions) as SWRResponse<
    ApiResponse["get"][T],
    unknown
  >;
}

function getQueryString(query: Record<string, unknown> | undefined) {
  if (!query) {
    return "";
  }

  const res = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    res.set(key, String(value));
  }
  return res.toString();
}
