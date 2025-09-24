// Taken from the docs: https://swr.vercel.app/docs/error-handling
export async function swrFetcher(resource: string | URL | globalThis.Request, init?: RequestInit) {
  const effectiveInit = {
    ...init,
    headers: {
      ...init?.headers,
      Accept: "application/problem+json,application/json",
    },
  };

  try {
    const res = await fetch(resource, effectiveInit);
    if (!res.ok) {
      if (res.headers.get("content-type") === "application/problem+json") {
        return await handleProblemJson(res);
      }
      return await handleLegacyError(res);
    }

    // Not using "return res.json()" because we want to handle the error in this try-block
    return await res.json();
  } catch (err) {
    throw new ApiError("Network error", undefined, undefined, err);
  }
}

async function handleLegacyError(res: Response): Promise<ApiError> {
  import.meta.env.DEV && console.error("Got legacy API error", res);

  let info = undefined;
  try {
    info = (await res.json()) as object;
  } catch (err) {
    // Ignore, server responded with invalid json
  }
  return new ApiError("An error occurred while fetching.", res.status, info);
}

/**
 * base object for RFC 9457 Problem Details for HTTP APIs.
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
}

async function handleProblemJson(res: Response): Promise<ApiError> {
  const details = (await res.json()) as ProblemDetails;
  return new ApiError(
    details.detail ?? details.title ?? "An error occurred while fetching.",
    res.status,
    details,
  );
}

export default class ApiError extends Error {
  ok: false;
  status: number | undefined;
  info: NonNullable<unknown> | undefined;

  constructor(
    message: string,
    status: number | undefined,
    info: NonNullable<unknown> | undefined,
    cause?: unknown,
  ) {
    super(message);
    this.ok = false;
    this.name = "ApiError";
    this.status = status;
    this.info = info;
    this.cause = cause;
  }
}
