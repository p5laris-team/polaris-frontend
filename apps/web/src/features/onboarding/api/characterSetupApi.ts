import { useMutation, useQuery } from "@tanstack/react-query";

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

export function getCharacterTypes() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetCharacterTypes());
  }

  return unwrapApiResponse<CharacterTypeListResponse>(
    apiClient.get("/api/character/v1/character-types", {
      params: { active: true },
    }),
  );
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
