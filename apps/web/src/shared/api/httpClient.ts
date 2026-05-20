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

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  config.headers = AxiosHeaders.from(config.headers);

  // 인증 토큰은 화면이나 훅이 직접 붙이지 않고 모든 REST 요청에서 한 번에 처리한다.
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as Partial<ApiResponse<unknown>>;

    if (body && body.success === false) {
      throw new PolarisApiError(body.error ?? createFallbackApiError("요청 처리에 실패했어요."));
    }

    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
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
