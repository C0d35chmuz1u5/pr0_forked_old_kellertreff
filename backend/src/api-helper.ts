import type { SuccessResponse, ErrorResponse } from "./shared/api-types.js";

export function ok<T>(): SuccessResponse<undefined>;
export function ok<T>(data: T): SuccessResponse<T>;
export function ok<T>(data?: T): SuccessResponse<T | undefined> {
	return {
		success: true,
		data,
	};
}

export function error(name: string, message: string): ErrorResponse {
	return {
		success: false,
		name,
		message,
	};
}
