/**
 * 온보딩 단계의 캐릭터 타입 조회와 캐릭터 생성 API를 담당합니다.
 * 백엔드에 없는 소개 태그/설명은 프론트 메타데이터로 보강해 선택 카드 품질을 유지합니다.
 */
import { useMutation, useQuery } from "@tanstack/react-query";

import { toCharacterKey } from "@/entities/character/types";
import {
  type CharacterTypeListResponse,
  type CreateCharacterRequest,
  type CreatedCharacterResponse,
} from "@/features/onboarding/model/onboardingTypes";
import { demoCreateCharacter, demoGetCharacterTypes } from "@/features/onboarding/model/onboardingFixtures";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

export const characterSetupQueryKeys = {
  all: ["character-setup"] as const,
  types: () => [...characterSetupQueryKeys.all, "types"] as const,
};

const CHARACTER_METADATA: Record<string, { tags: string[]; description: string }> = {
  NOVA: {
    tags: ["다정함", "기억 수집", "느린 응원"],
    description: "자기가 한때 하늘의 길을 비추던 별이었다는 걸 까먹은 별알이에요. 작은 일을 해낼 때마다 빛을 되찾아요.",
  },
  MUMU: {
    tags: ["공감형", "새싹돋음", "느긋함"],
    description: "오래 기다리다 말을 잃어버리고 '무...'로 감정을 전해요. 행동을 실천할 때마다 잎을 파르르 떨며 기뻐합니다.",
  },
  JJORI: {
    tags: ["현실파", "시크함", "원정러"],
    description: "늘 배낭을 메고 있지만 먼 여행은 가본 적이 없어요. 현관문 밖으로 나서는 일도 위대한 원정이라 믿습니다.",
  },
};

/** 선택 가능한 캐릭터 타입 목록을 조회하고 카드 표시용 메타데이터를 보강합니다. */
export async function getCharacterTypes() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetCharacterTypes());
  }

  const response = await unwrapApiResponse<CharacterTypeListResponse>(
    apiClient.get("/api/character/v1/character-types", {
      params: { active: true },
    }),
  );

  if (response && Array.isArray(response.items)) {
    response.items = response.items.map((item) => {
      const key = toCharacterKey(item.code).toUpperCase();
      const meta = CHARACTER_METADATA[key];
      return {
        ...item,
        tags: item.tags || meta?.tags || [],
        description: item.description || meta?.description || "",
      };
    });
  }

  return response;
}

/** 선택한 타입과 이름으로 사용자의 첫 캐릭터를 생성합니다. */
export function createCharacter(body: CreateCharacterRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoCreateCharacter(body));
  }

  return unwrapApiResponse<CreatedCharacterResponse>(
    apiClient.post("/api/character/v1/characters", body),
  );
}

/** 캐릭터 선택 화면에서 타입 목록을 조회하는 hook입니다. */
export function useCharacterTypesQuery() {
  return useQuery({
    queryKey: characterSetupQueryKeys.types(),
    queryFn: getCharacterTypes,
  });
}

/** 캐릭터 이름 설정 화면에서 생성 요청을 보내는 mutation hook입니다. */
export function useCreateCharacterMutation() {
  return useMutation({
    mutationFn: createCharacter,
  });
}
