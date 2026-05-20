import { type ApiError } from "@/shared/api/types";

export class PolarisApiError extends Error {
  readonly apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "PolarisApiError";
    this.apiError = apiError;
  }
}

export function isPolarisApiError(error: unknown): error is PolarisApiError {
  return error instanceof PolarisApiError;
}

export function createFallbackApiError(message: string, path = "unknown"): ApiError {
  return {
    timestamp: new Date().toISOString(),
    status: 500,
    code: "CLIENT_UNEXPECTED_ERROR",
    message,
    path,
  };
}

export function getUserFacingErrorMessage(error: unknown) {
  if (isPolarisApiError(error)) {
    if (error.apiError.retryAfterSeconds) {
      return `잠시 쉬었다가 다시 시도해 주세요. ${error.apiError.retryAfterSeconds}초 뒤에 가능해요.`;
    }

    // 서버 문구가 기술적일 수 있어도 화면에는 Polaris 톤의 짧은 안내만 우선 노출한다.
    return error.apiError.message || "잠시 연결이 흔들렸어요. 다시 시도해 주세요.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 문제가 생겼어요. 다시 시도해 주세요.";
}
