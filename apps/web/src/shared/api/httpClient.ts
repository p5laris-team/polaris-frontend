import axios, { AxiosHeaders, type AxiosError, type AxiosResponse } from "axios";

import { useAuthStore } from "@/stores/authStore";
import { PolarisApiError, createFallbackApiError } from "@/shared/api/apiError";
import { type ApiResponse } from "@/shared/api/types";
import { runtimeConfig } from "@/shared/config/env";

export const apiClient = axios.create({
  baseURL: runtimeConfig.apiBaseUrl || undefined,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 갱신 프로미스 (병렬 요청 시 데두플리케이션을 위해 공유됨)
let refreshPromise: Promise<string> | null = null;

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

// 순환 참조 방지를 위해 authApi.ts를 통하지 않고 직접 raw axios 호출로 구현
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

// Access Token을 미리 검증하고 필요한 경우 갱신하는 헬퍼 함수
async function getOrRefreshAccessToken(): Promise<string | null> {
  const { accessToken, refreshToken, clearSession } = useAuthStore.getState();
  if (!accessToken) return null;

  // 만료 30초 전이거나 이미 만료된 경우 갱신
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

// Request Interceptor: 요청 전에 만료 여부를 판별하여 선제적(Proactive)으로 갱신
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

// Response Interceptor: 401 Unauthorized 에러 시 사후(Reactive) 대응
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as Partial<ApiResponse<unknown>>;

    if (body && body.success === false) {
      throw new PolarisApiError(body.error ?? createFallbackApiError("요청 처리에 실패했어요."));
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
          if (error.response?.data?.error) {
            return Promise.reject(new PolarisApiError(error.response.data.error));
          }
          return Promise.reject(error);
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
          return Promise.reject(refreshError);
        }
      }
    }

    if (error.response?.data?.error) {
      return Promise.reject(new PolarisApiError(error.response.data.error));
    }

    return Promise.reject(error);
  },
);

export async function unwrapApiResponse<T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<T> {
  const response = await request;
  const body = response.data;

  if (!body.success) {
    throw new PolarisApiError(body.error ?? createFallbackApiError("요청 처리에 실패했어요."));
  }

  return body.data as T;
}
