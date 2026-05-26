/**
 * 마이페이지의 사용자 정보 조회와 로그아웃 처리를 담당하는 API 계층입니다.
 * fixture 모드에서는 실제 세션 없이도 로그아웃 UI 흐름을 확인할 수 있게 성공 응답을 반환합니다.
 */
import { useMutation, useQuery } from "@tanstack/react-query";

import { logoutCurrentSession } from "@/features/auth/api/authApi";
import { getDemoMyPageUser } from "@/features/my-page/model/myPageFixtures";
import { type LogoutResult, type MyPageUser } from "@/features/my-page/model/myPageTypes";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

export const myPageQueryKeys = {
  all: ["my-page"] as const,
  user: () => [...myPageQueryKeys.all, "user"] as const,
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

/** 마이페이지 사용자 카드에서 사용하는 조회 hook입니다. */
export function useMyPageUserQuery() {
  return useQuery({
    queryKey: myPageQueryKeys.user(),
    queryFn: getMyPageUser,
  });
}

/** 로그아웃 버튼에서 사용하는 mutation hook입니다. */
export function useLogoutMyPageSessionMutation() {
  return useMutation({
    mutationFn: logoutMyPageSession,
  });
}
