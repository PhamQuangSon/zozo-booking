export type ApiSuccess<T = unknown> = {
  status: "success";
  data: T;
};

export type ApiError = {
  status: "error";
  error: string;
};

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export function successResponse<T = unknown>(data: T): ApiSuccess<T> {
  return { status: "success", data };
}

export function errorResponse(message: string): ApiError {
  return { status: "error", error: message };
}
