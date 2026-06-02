/**
 * 마이페이지의 사용자 정보 조회와 로그아웃 처리를 담당하는 API 계층입니다.
 * fixture 모드에서는 실제 세션 없이도 로그아웃 UI 흐름을 확인할 수 있게 성공 응답을 반환합니다.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { logoutCurrentSession } from "@/features/auth/api/authApi";
import {
  demoGetMyWeatherRegion,
  demoListWeatherRegions,
  demoUpdateMyWeatherRegion,
  getDemoMyPageUser,
} from "@/features/my-page/model/myPageFixtures";
import {
  type LogoutResult,
  type MyPageUser,
  type SelectedWeatherRegionResponse,
  type UpdateWeatherRegionRequest,
  type WeatherRegionListResponse,
} from "@/features/my-page/model/myPageTypes";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

export const myPageQueryKeys = {
  all: ["my-page"] as const,
  user: () => [...myPageQueryKeys.all, "user"] as const,
  weatherRegions: () => [...myPageQueryKeys.all, "weather-regions"] as const,
  selectedWeatherRegion: () => [...myPageQueryKeys.all, "selected-weather-region"] as const,
};

/** 마이페이지에 보여 줄 현재 사용자 정보를 조회합니다. */
export function getMyPageUser() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(getDemoMyPageUser());
  }

  return unwrapApiResponse<MyPageUser>(apiClient.get("/api/user/v1/users/me"));
}

/** 현재 세션을 로그아웃합니다. 실제 API 모드에서는 auth logout endpoint를 재사용합니다. */
export function logoutMyPageSession() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve({ loggedOut: true } satisfies LogoutResult);
  }

  return logoutCurrentSession();
}

/** 사용자가 선택할 수 있는 날씨 권역 목록을 조회합니다. */
export function listWeatherRegions() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoListWeatherRegions());
  }

  return unwrapApiResponse<WeatherRegionListResponse>(
    apiClient.get("/api/user/v1/weather-regions"),
  );
}

/** 현재 사용자의 미션 추천용 날씨 권역을 조회합니다. */
export function getMyWeatherRegion() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetMyWeatherRegion());
  }

  return unwrapApiResponse<SelectedWeatherRegionResponse>(
    apiClient.get("/api/user/v1/users/me/weather-region"),
  );
}

/** 현재 사용자의 미션 추천용 날씨 권역을 저장합니다. */
export function updateMyWeatherRegion(body: UpdateWeatherRegionRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoUpdateMyWeatherRegion(body));
  }

  return unwrapApiResponse<SelectedWeatherRegionResponse>(
    apiClient.put("/api/user/v1/users/me/weather-region", body),
  );
}

/** 마이페이지 사용자 카드에서 사용하는 조회 hook입니다. */
export function useMyPageUserQuery() {
  return useQuery({
    queryKey: myPageQueryKeys.user(),
    queryFn: getMyPageUser,
  });
}

export function useWeatherRegionsQuery() {
  return useQuery({
    queryKey: myPageQueryKeys.weatherRegions(),
    queryFn: listWeatherRegions,
  });
}

export function useMyWeatherRegionQuery() {
  return useQuery({
    queryKey: myPageQueryKeys.selectedWeatherRegion(),
    queryFn: getMyWeatherRegion,
  });
}

/** 로그아웃 버튼에서 사용하는 mutation hook입니다. */
export function useLogoutMyPageSessionMutation() {
  return useMutation({
    mutationFn: logoutMyPageSession,
  });
}

export function useUpdateMyWeatherRegionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyWeatherRegion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: myPageQueryKeys.selectedWeatherRegion() });
    },
  });
}
