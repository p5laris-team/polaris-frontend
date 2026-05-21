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

export function createCharacter(body: CreateCharacterRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoCreateCharacter(body));
  }

  return unwrapApiResponse<CreatedCharacterResponse>(
    apiClient.post("/api/character/v1/characters", body),
  );
}

export function useCharacterTypesQuery() {
  return useQuery({
    queryKey: characterSetupQueryKeys.types(),
    queryFn: getCharacterTypes,
  });
}

export function useCreateCharacterMutation() {
  return useMutation({
    mutationFn: createCharacter,
  });
}
