/**
 * 홈 화면에서 필요한 요약 데이터를 조회하는 API 계층입니다.
 * 지갑, 캐릭터, 현재 미션, 알림 요약을 한 번에 받아 홈 화면의 첫 상태를 만듭니다.
 */
import { useQuery } from "@tanstack/react-query";

import { type HomeResponse } from "@/entities/home/types";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";
import { getDemoHomeResponse } from "@/features/home/model/homeFixture";

export const homeQueryKeys = {
  all: ["home"] as const,
  summary: () => [...homeQueryKeys.all, "summary"] as const,
};

/** fixture 모드에서는 demo 데이터를, 실제 API 모드에서는 gateway의 home summary를 조회합니다. */
export async function getHome() {
  if (runtimeConfig.useApiFixtures) {
    return getDemoHomeResponse();
  }

  return unwrapApiResponse<HomeResponse>(apiClient.get("/api/home/v1/home"));
}

/** 홈 화면 컴포넌트에서 사용하는 React Query hook입니다. */
export function useHomeQuery() {
  return useQuery({
    queryKey: homeQueryKeys.summary(),
    queryFn: getHome,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}
