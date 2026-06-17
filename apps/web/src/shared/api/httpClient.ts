import axios, { AxiosHeaders, type AxiosError, type AxiosResponse } from "axios";
import * as Sentry from "@sentry/react";

import { useAuthStore } from "@/stores/authStore";
import { PolarisApiError, createFallbackApiError } from "@/shared/api/apiError";
import { type ApiResponse } from "@/shared/api/types";
import { runtimeConfig } from "@/shared/config/env";

/**
 * Sentry로 API 에러를 선별 수집하고 마스킹하는 헬퍼 함수입니다.
 */
function captureApiClientError(error: any) {
  if (!runtimeConfig.sentry.enabled) return;

  const status = error.response?.status;
  const url = error.config?.url || "";
  const method = error.config?.method || "";
  
  let polarisErrorCode = "";
  let message = error.message || "API Error";
  
  if (error instanceof PolarisApiError) {
    polarisErrorCode = error.apiError.code || "";
    message = error.apiError.message || message;
  } else if (error.response?.data?.error) {
    polarisErrorCode = error.response.data.error.code || "";
    message = error.response.data.error.message || message;
  }

  // 필터 조건: 5xx 에러, 네트워크 장애(status 없음), 토큰 재발급 실패, 또는 핵심 실패 플로우 API
  const is5xx = status >= 500 && status < 600;
  const isNetworkError = !status && error.code !== "ERR_CANCELED";
  const isTokenRefreshFailure = url.includes("/api/auth/v1/token-refreshes");
  const isCrucialFailure = 
    url.includes("/api/auth/v1/google/sessions") || 
    url.includes("/completion-answers") || 
    url.includes("/share-cards") ||
    url.includes("/share-events") ||
    url.includes("/item-purchases");

  if (is5xx || isNetworkError || isTokenRefreshFailure || isCrucialFailure) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "api_client");
      scope.setTag("api.method", method.toUpperCase());
      
      // 고유 식별자 방지용 템플릿화
      const pathTemplate = url
        .replace(/\/api\/mission\/v1\/missions\/\d+/g, "/api/mission/v1/missions/{missionId}")
        .replace(/\/api\/character\/v1\/characters\/\d+/g, "/api/character/v1/characters/{characterId}")
        .replace(/\/api\/notification\/v1\/notifications\/\d+/g, "/api/notification/v1/notifications/{notificationId}");
      
      scope.setTag("api.endpoint", `${method.toUpperCase()} ${pathTemplate}`);
      if (status) {
        scope.setTag("api.status", String(status));
      }
      if (polarisErrorCode) {
        scope.setTag("api.error_code", polarisErrorCode);
      }

      scope.setContext("API Details", {
        url,
        method: method.toUpperCase(),
        status,
        polarisErrorCode,
        message,
        // PII 마스킹 처리 (Authorization 헤더 제거)
        headers: error.config?.headers ? {
          ...error.config.headers,
          Authorization: "[MASKED]",
          authorization: "[MASKED]",
          "X-Refresh-Token": "[MASKED]",
          "x-refresh-token": "[MASKED]",
        } : undefined,
      });

      Sentry.captureException(error);
    });
  }
}

/**
 * Polaris REST API를 호출할 때 공통으로 사용하는 Axios 인스턴스입니다.
 * baseURL, timeout, JSON header, 인증 token 처리, 에러 변환을 여기에서 통일합니다.
 */
export const apiClient = axios.create({
  baseURL: runtimeConfig.apiBaseUrl || undefined,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 갱신 Promise는 병렬 요청이 동시에 401을 받아도 재발급 API를 한 번만 호출하기 위해 공유한다.
let refreshPromise: Promise<string> | null = null;

/**
 * JWT payload의 exp 값을 읽어 access token 만료 여부를 판단합니다.
 * fixture 모드에서는 실제 JWT가 없어도 화면 테스트가 가능해야 하므로 항상 만료되지 않은 것으로 봅니다.
 */
function isTokenExpired(token: string, offsetSeconds = 0): boolean {
  if (runtimeConfig.useApiFixtures) return false;
  if (!token || !token.includes(".")) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = typeof window !== "undefined" && typeof window.atob === "function"
      ? window.atob(base64)
      : Buffer.from(base64, "base64").toString("utf-8");

    const payload = JSON.parse(jsonPayload);
    if (typeof payload.exp !== "number") return false;

    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp - nowSeconds < offsetSeconds;
  } catch (e) {
    return false;
  }
}

// authApi.ts가 apiClient를 쓰기 때문에, token refresh만 raw axios로 호출해 순환 참조를 피한다.
/**
 * refresh token으로 새 access/refresh token 쌍을 받아옵니다.
 * apiClient interceptor와 순환 참조가 생기지 않도록 이 함수만 raw axios를 사용합니다.
 */
async function refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const baseURL = runtimeConfig.apiBaseUrl || "";
  const response = await axios.post(`${baseURL}/api/auth/v1/token-refreshes`, {
    refreshToken,
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const body = response.data;
  if (!body || body.success === false) {
    throw new Error(body?.error?.message || "토큰 재발급 요청에 실패했습니다.");
  }
  return body.data;
}

// access token을 미리 검증하고 필요한 경우 갱신하는 헬퍼 함수다.
/**
 * 요청을 보내기 전에 access token을 확인하고, 만료가 가까우면 먼저 갱신합니다.
 * 동시에 여러 API가 호출되어도 refreshPromise 하나를 공유해 재발급 요청을 한 번만 보냅니다.
 */
export async function getOrRefreshAccessToken(): Promise<string | null> {
  const { accessToken, refreshToken, clearSession } = useAuthStore.getState();
  if (!accessToken) return null;

  // 만료 30초 전이거나 이미 만료된 경우 사용자 요청 전에 먼저 갱신한다.
  if (isTokenExpired(accessToken, 30)) {
    if (!refreshToken) {
      clearSession();
      return null;
    }

    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const data = await refreshTokens(refreshToken);
          useAuthStore.setState({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
          return data.accessToken;
        } catch (err) {
          clearSession();
          throw err;
        } finally {
          refreshPromise = null;
        }
      })();
    }
    return refreshPromise;
  }

  return accessToken;
}

// request interceptor는 요청 직전에 token 만료 여부를 보고 선제적으로 갱신한다.
apiClient.interceptors.request.use(async (config) => {
  config.headers = AxiosHeaders.from(config.headers);

  // 토큰 재발급 API 요청 자체가 아닐 때만 갱신 확인 진행
  if (!config.url?.includes("/api/auth/v1/token-refreshes")) {
    try {
      const token = await getOrRefreshAccessToken();
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (err) {
      console.error("Proactive token refresh failed:", err);
    }
  } else {
    // 토큰 재발급 요청 시에는 현재 가지고 있는 토큰을 그대로 사용하지 않거나,
    // 필요 시 authorization을 제외할 수 있으나 여기선 그대로 통과시킵니다.
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  return config;
});

// response interceptor는 401 Unauthorized가 돌아왔을 때 한 번 더 token refresh 후 원 요청을 재시도한다.
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as Partial<ApiResponse<unknown>>;

    if (body && body.success === false) {
      const apiError = new PolarisApiError(body.error ?? createFallbackApiError("요청 처리에 실패했어요."));
      captureApiClientError(apiError);
      throw apiError;
    }

    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config;

    // 만약 401 에러(Unauthorized)가 발생했고, 원래 요청이 존재하며,
    // 토큰 재발급 API 요청 자체가 아니라면 토큰 갱신 처리를 진행한다.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes("/api/auth/v1/token-refreshes")
    ) {
      if (originalRequest.headers) {
        originalRequest.headers = AxiosHeaders.from(originalRequest.headers);
      } else {
        originalRequest.headers = new AxiosHeaders();
      }

      if (!originalRequest.headers.get("X-Retry-Attempt")) {
        originalRequest.headers.set("X-Retry-Attempt", "true");

        const { refreshToken, clearSession } = useAuthStore.getState();
        if (!refreshToken) {
          clearSession();
          let finalError: any = error;
          if (error.response?.data?.error) {
            finalError = new PolarisApiError(error.response.data.error);
          }
          captureApiClientError(finalError);
          return Promise.reject(finalError);
        }

        try {
          if (!refreshPromise) {
            refreshPromise = (async () => {
              try {
                const data = await refreshTokens(refreshToken);
                useAuthStore.setState({
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                });
                return data.accessToken;
              } catch (refreshErr) {
                clearSession();
                throw refreshErr;
              } finally {
                refreshPromise = null;
              }
            })();
          }

          const newAccessToken = await refreshPromise;
          originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
          return apiClient(originalRequest);
        } catch (refreshError) {
          captureApiClientError(refreshError);
          return Promise.reject(refreshError);
        }
      }
    }

    let finalError: any = error;
    if (error.response?.data?.error) {
      finalError = new PolarisApiError(error.response.data.error);
    }
    captureApiClientError(finalError);
    return Promise.reject(finalError);
  },
);

export async function unwrapApiResponse<T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<T> {
  // 백엔드 공통 응답 포맷을 화면에서 바로 쓰는 data 타입으로 변환한다.
  const response = await request;
  const body = response.data;

  if (!body.success) {
    throw new PolarisApiError(body.error ?? createFallbackApiError("요청 처리에 실패했어요."));
  }

  return body.data as T;
}
