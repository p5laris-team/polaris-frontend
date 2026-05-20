import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { homeQueryKeys } from "@/features/home/api/homeApi";
import {
  demoCreateCareLog,
  demoGetActiveCharacter,
  demoGetCharacterStatus,
} from "@/features/character/model/characterCareFixtures";
import {
  type ActiveCharacterResponse,
  type CharacterCareRequest,
  type CharacterCareResultResponse,
  type CharacterStatusResponse,
} from "@/features/character/model/characterCareTypes";
import { apiClient, createIdempotencyKey, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

export const characterCareQueryKeys = {
  all: ["character-care"] as const,
  active: () => [...characterCareQueryKeys.all, "active"] as const,
  status: (characterId: number) => [...characterCareQueryKeys.all, "status", characterId] as const,
};

export function getActiveCharacter() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetActiveCharacter());
  }

  return unwrapApiResponse<ActiveCharacterResponse>(
    apiClient.get("/api/character/v1/characters/me"),
  );
}

export function getCharacterStatus(characterId: number) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetCharacterStatus(characterId));
  }

  return unwrapApiResponse<CharacterStatusResponse>(
    apiClient.get(`/api/character/v1/characters/${characterId}/status`),
  );
}

export function createCareLog(characterId: number, body: CharacterCareRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoCreateCareLog(characterId, body));
  }

  return unwrapApiResponse<CharacterCareResultResponse>(
    apiClient.post(`/api/character/v1/characters/${characterId}/care-logs`, body, {
      // SCR-012 돌봄 액션은 보상/차감 중복 방지를 위해 API 명세의 Idempotency-Key 헤더를 사용한다.
      headers: {
        "Idempotency-Key": createIdempotencyKey(`character-care:${characterId}:${body.actionType}`),
      },
    }),
  );
}

export function useActiveCharacterQuery() {
  return useQuery({
    queryKey: characterCareQueryKeys.active(),
    queryFn: getActiveCharacter,
  });
}

export function useCharacterStatusQuery(characterId: number | null) {
  return useQuery({
    queryKey: characterId ? characterCareQueryKeys.status(characterId) : characterCareQueryKeys.status(0),
    queryFn: () => getCharacterStatus(characterId ?? 0),
    enabled: Boolean(characterId),
  });
}

export function useCreateCareLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ characterId, body }: { characterId: number; body: CharacterCareRequest }) =>
      createCareLog(characterId, body),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: characterCareQueryKeys.active() }),
        queryClient.invalidateQueries({ queryKey: characterCareQueryKeys.status(variables.characterId) }),
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.summary() }),
      ]);
    },
  });
}
