/**
 * 활성 캐릭터 조회, 상태 조회, 돌봄 액션 생성을 담당하는 API 계층입니다.
 * 캐릭터 상세 화면과 홈 요약이 같은 캐릭터 상태를 보도록 query key를 공유합니다.
 */
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

/** 로그인 사용자의 현재 활성 캐릭터를 조회합니다. */
export function getActiveCharacter() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetActiveCharacter());
  }

  return unwrapApiResponse<ActiveCharacterResponse>(
    apiClient.get("/api/character/v1/characters/me"),
  );
}

/** 캐릭터의 배고픔/에너지/애정도 같은 현재 상태를 조회합니다. */
export function getCharacterStatus(characterId: number) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetCharacterStatus(characterId));
  }

  return unwrapApiResponse<CharacterStatusResponse>(
    apiClient.get(`/api/character/v1/characters/${characterId}/status`),
  );
}

/** 밥주기/쉬기/놀기 같은 돌봄 액션을 서버에 기록하고 변경된 상태를 받아옵니다. */
export function createCareLog(characterId: number, body: CharacterCareRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoCreateCareLog(characterId, body));
  }

  return unwrapApiResponse<CharacterCareResultResponse>(
    apiClient.post(`/api/character/v1/characters/${characterId}/care-logs`, body, {
      // 돌봄 액션은 보상/아이템 차감 중복 방지를 위해 API 명세의 Idempotency-Key 헤더를 사용한다.
      headers: {
        "Idempotency-Key": createIdempotencyKey(`character-care:${characterId}:${body.actionType}`),
      },
    }),
  );
}

/** 활성 캐릭터를 화면에서 조회할 때 쓰는 hook입니다. */
export function useActiveCharacterQuery(enabled = true) {
  return useQuery({
    queryKey: characterCareQueryKeys.active(),
    queryFn: getActiveCharacter,
    enabled,
  });
}

/** 선택된 캐릭터가 있을 때만 상태 API를 호출하는 hook입니다. */
export function useCharacterStatusQuery(characterId: number | null) {
  return useQuery({
    queryKey: characterId ? characterCareQueryKeys.status(characterId) : characterCareQueryKeys.status(0),
    queryFn: () => getCharacterStatus(characterId ?? 0),
    enabled: Boolean(characterId),
  });
}

/** 돌봄 액션 성공 후 캐릭터, 홈, 인벤토리 캐시를 함께 갱신합니다. */
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
        // 돌봄은 소모품 수량을 차감하므로 보유 아이템 조회 캐시를 함께 갱신한다.
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
      ]);
    },
  });
}
