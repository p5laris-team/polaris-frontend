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

export function getMyPageUser() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(getDemoMyPageUser());
  }

  return unwrapApiResponse<MyPageUser>(apiClient.get("/api/user/v1/users/me"));
}

export function logoutMyPageSession() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve({ loggedOut: true } satisfies LogoutResult);
  }

  return logoutCurrentSession();
}

export function useMyPageUserQuery() {
  return useQuery({
    queryKey: myPageQueryKeys.user(),
    queryFn: getMyPageUser,
  });
}

export function useLogoutMyPageSessionMutation() {
  return useMutation({
    mutationFn: logoutMyPageSession,
  });
}
