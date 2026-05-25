import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { homeQueryKeys } from "@/features/home/api/homeApi";
import { walletQueryKeys } from "@/features/wallet/api/walletApi";
import {
  demoCreateShareCard,
  demoCreateShareEvent,
  demoGetPresignedUrl,
  demoGetTodayShareStatus,
} from "@/features/share/model/shareFixtures";
import {
  type CreateShareCardRequest,
  type CreateShareEventRequest,
  type PresignedUrlResponse,
  type ShareCardResponse,
  type ShareEventResponse,
  type TodayShareStatusResponse,
} from "@/features/share/model/shareTypes";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

export const shareQueryKeys = {
  all: ["share"] as const,
  todayStatus: () => [...shareQueryKeys.all, "today-status"] as const,
};

export function getPresignedShareCardUrl(extension = "png") {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetPresignedUrl());
  }

  return unwrapApiResponse<PresignedUrlResponse>(
    apiClient.get("/api/share/v1/presigned-url", {
      params: { extension },
    }),
  );
}

export async function uploadShareCardImage(presignedUrl: string, imageBlob: Blob) {
  if (runtimeConfig.useApiFixtures) {
    return;
  }

  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": imageBlob.type || "image/png",
    },
    body: imageBlob,
  });

  if (!response.ok) {
    throw new Error("공유 카드 이미지를 업로드하지 못했어요.");
  }
}

export function createShareCard(body: CreateShareCardRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoCreateShareCard(body));
  }

  return unwrapApiResponse<ShareCardResponse>(
    apiClient.post("/api/share/v1/share-cards", body),
  );
}

export function createShareEvent(body: CreateShareEventRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoCreateShareEvent(body));
  }

  return unwrapApiResponse<ShareEventResponse>(
    apiClient.post("/api/share/v1/share-events", body),
  );
}

export function getTodayShareStatus() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetTodayShareStatus());
  }

  return unwrapApiResponse<TodayShareStatusResponse>(
    apiClient.get("/api/share/v1/share-events/today"),
  );
}

export function useTodayShareStatusQuery() {
  return useQuery({
    queryKey: shareQueryKeys.todayStatus(),
    queryFn: getTodayShareStatus,
  });
}

export function useCreateShareCardFlowMutation() {
  return useMutation({
    mutationFn: async ({
      characterId,
      headline,
      imageBlob,
    }: {
      characterId: number;
      headline: string;
      imageBlob: Blob;
    }) => {
      const upload = await getPresignedShareCardUrl("png");

      await uploadShareCardImage(upload.presignedUrl, imageBlob);

      return createShareCard({
        characterId,
        headline,
        imageUrl: upload.imageUrl,
      });
    },
  });
}

export function useCreateShareEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShareEvent,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shareQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.summary() }),
        queryClient.invalidateQueries({ queryKey: walletQueryKeys.all }),
      ]);
    },
  });
}
