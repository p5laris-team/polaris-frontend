import { useQuery } from "@tanstack/react-query";

import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";
import { type BannerAdConfig, type AdPlacement } from "@/features/ad/model/adTypes";

type BannerConfigParams = {
  placement: AdPlacement;
  path: string;
  enabled?: boolean;
};

const adQueryKeys = {
  bannerConfig: (placement: AdPlacement, path: string) => ["ad", "banner-config", placement, path] as const,
};

export async function getBannerAdConfig({
  placement,
  path,
}: Pick<BannerConfigParams, "placement" | "path">): Promise<BannerAdConfig> {
  return unwrapApiResponse(
    apiClient.get("/api/ad/v1/banner-config", {
      params: {
        placement,
        path,
      },
    }),
  );
}

export function useBannerAdConfigQuery({
  placement,
  path,
  enabled = true,
}: BannerConfigParams) {
  return useQuery({
    queryKey: adQueryKeys.bannerConfig(placement, path),
    queryFn: () => getBannerAdConfig({ placement, path }),
    enabled: enabled && !runtimeConfig.useApiFixtures,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
  });
}
