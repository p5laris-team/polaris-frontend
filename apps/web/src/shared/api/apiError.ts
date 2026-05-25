import { type ApiError } from "@/shared/api/types";

/**
 * 백엔드의 ApiError를 JavaScript Error처럼 다루기 위한 프론트 전용 에러 타입입니다.
 * React Query와 화면 컴포넌트가 status/code/message를 그대로 확인할 수 있게 원본 apiError를 보관합니다.
 */
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

/**
 * 네트워크 오류처럼 백엔드 표준 에러가 없는 상황에서도 화면이 같은 방식으로 에러를 처리하게 만드는 fallback입니다.
 */
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
  // 사용자에게는 기술적인 stack trace보다 짧고 행동 가능한 안내 문구를 보여준다.
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
