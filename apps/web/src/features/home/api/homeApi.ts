import { useQuery } from "@tanstack/react-query";

import { type HomeResponse } from "@/entities/home/types";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";
import { getDemoHomeResponse } from "@/features/home/model/homeFixture";

export const homeQueryKeys = {
  all: ["home"] as const,
  summary: () => [...homeQueryKeys.all, "summary"] as const,
};

export async function getHome() {
  if (runtimeConfig.useApiFixtures) {
    return getDemoHomeResponse();
  }

  return unwrapApiResponse<HomeResponse>(apiClient.get("/api/home/v1/home"));
}

export function useHomeQuery() {
  return useQuery({
    queryKey: homeQueryKeys.summary(),
    queryFn: getHome,
  });
}
