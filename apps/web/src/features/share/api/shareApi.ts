/**
 * 공유 카드 이미지 업로드, 공유 카드 생성, 공유 보상 이벤트 생성을 담당하는 API 계층입니다.
 * presigned URL 업로드와 백엔드 메타데이터 저장이 분리되어 있어 flow mutation으로 묶어 둡니다.
 */
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

/** 공유 카드 이미지를 직접 업로드할 presigned URL을 백엔드에서 받아옵니다. */
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

/** 브라우저에서 만든 공유 카드 이미지를 presigned URL로 업로드합니다. */
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

/** 업로드된 이미지 URL과 문구를 백엔드 공유 카드 row로 저장합니다. */
export function createShareCard(body: CreateShareCardRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoCreateShareCard(body));
  }

  return unwrapApiResponse<ShareCardResponse>(
    apiClient.post("/api/share/v1/share-cards", body),
  );
}

/** 실제 공유 행위를 기록하고 일일 공유 보상 결과를 받아옵니다. */
export function createShareEvent(body: CreateShareEventRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoCreateShareEvent(body));
  }

  return unwrapApiResponse<ShareEventResponse>(
    apiClient.post("/api/share/v1/share-events", body),
  );
}

/** 오늘 공유 보상을 이미 받았는지 확인합니다. */
export function getTodayShareStatus() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetTodayShareStatus());
  }

  return unwrapApiResponse<TodayShareStatusResponse>(
    apiClient.get("/api/share/v1/share-events/today"),
  );
}

/** 공유 카드 화면에서 오늘 공유 상태를 조회하는 hook입니다. */
export function useTodayShareStatusQuery() {
  return useQuery({
    queryKey: shareQueryKeys.todayStatus(),
    queryFn: getTodayShareStatus,
  });
}

/** 이미지 업로드와 공유 카드 row 생성을 한 번의 화면 액션으로 묶은 mutation hook입니다. */
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

/** 공유 이벤트 생성 후 공유/홈/지갑 캐시를 갱신합니다. */
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
