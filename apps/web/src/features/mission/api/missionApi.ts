import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getDemoHomeResponse,
  demoGetTodayMissions,
  demoRejectMission,
  demoRequestNextMission,
  demoStartCompletionSession,
  demoSubmitCompletionAnswer,
} from "@/features/home/model/homeFixture";
import { homeQueryKeys } from "@/features/home/api/homeApi";
import {
  type CurrentMissionResponse,
  type MissionCompletionQuestionResponse,
  type MissionCompletionResultResponse,
  type MissionRejectionResponse,
  type RequestNextMissionRequest,
  type SubmitMissionCompletionAnswerRequest,
  type TodayMissionsResponse,
} from "@/entities/mission/types";
import { walletQueryKeys } from "@/features/wallet/api/walletApi";
import { apiClient, isPolarisApiError, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

export const missionQueryKeys = {
  all: ["missions"] as const,
  current: () => [...missionQueryKeys.all, "current"] as const,
  todayFocus: (characterId: number | undefined) =>
    [...missionQueryKeys.all, "today-focus", characterId ?? "none"] as const,
  today: () => [...missionQueryKeys.all, "today"] as const,
};

function normalizeCurrentMission(
  mission: CurrentMissionResponse | null | undefined,
): CurrentMissionResponse | null {
  if (!mission || !mission.id || mission.id <= 0) {
    return null;
  }

  return mission;
}

export async function getCurrentMission() {
  if (runtimeConfig.useApiFixtures) {
    return normalizeCurrentMission(getDemoHomeResponse().currentMission);
  }

  const mission = await unwrapApiResponse<CurrentMissionResponse>(
    apiClient.get("/api/mission/v1/missions/current"),
  );

  return normalizeCurrentMission(mission);
}

export function getTodayMissions() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetTodayMissions());
  }

  return unwrapApiResponse<TodayMissionsResponse>(
    apiClient.get("/api/mission/v1/missions/today"),
  );
}

export function startMissionCompletionSession(missionId: number) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoStartCompletionSession(missionId));
  }

  return unwrapApiResponse<MissionCompletionQuestionResponse>(
    apiClient.post(`/api/mission/v1/missions/${missionId}/completion-sessions`, {}),
  );
}

export function rejectMission(missionId: number) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoRejectMission(missionId));
  }

  return unwrapApiResponse<MissionRejectionResponse>(
    apiClient.post(`/api/mission/v1/missions/${missionId}/rejections`, {}),
  );
}

export function requestNextMission(body: RequestNextMissionRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoRequestNextMission(body));
  }

  return unwrapApiResponse<CurrentMissionResponse>(
    apiClient.post("/api/mission/v1/missions/today-focus/next", body),
  );
}

export async function ensureTodayFocusMission(characterId: number) {
  const currentMission = await getCurrentMission();
  if (currentMission) {
    return currentMission;
  }

  try {
    return normalizeCurrentMission(await requestNextMission({ characterId }));
  } catch (error) {
    if (isPolarisApiError(error)) {
      if (error.apiError.code === "MISSION_ACTIVE_ALREADY_EXISTS") {
        return getCurrentMission();
      }

      if (error.apiError.code === "MISSION_DAILY_LIMIT_EXCEEDED") {
        return null;
      }
    }

    throw error;
  }
}

export function submitMissionCompletionAnswer(
  missionId: number,
  body: SubmitMissionCompletionAnswerRequest,
) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoSubmitCompletionAnswer(missionId, body.answer));
  }

  return unwrapApiResponse<MissionCompletionResultResponse>(
    apiClient.post(`/api/mission/v1/missions/${missionId}/completion-answers`, body),
  );
}

export function useCurrentMissionQuery() {
  return useQuery({
    queryKey: missionQueryKeys.current(),
    queryFn: getCurrentMission,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useTodayFocusMissionQuery(characterId: number | undefined) {
  return useQuery({
    queryKey: missionQueryKeys.todayFocus(characterId),
    queryFn: () => {
      if (!characterId) {
        return Promise.resolve(null);
      }

      return ensureTodayFocusMission(characterId);
    },
    enabled: Boolean(characterId),
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useTodayMissionsQuery() {
  return useQuery({
    queryKey: missionQueryKeys.today(),
    queryFn: getTodayMissions,
  });
}

export function useStartMissionCompletionSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startMissionCompletionSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: missionQueryKeys.all });
    },
  });
}

export function useRejectAndRequestNextMissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      missionId,
      characterId,
    }: {
      missionId: number;
      characterId: number;
    }) => {
      const rejection = await rejectMission(missionId);
      const nextMission = await requestNextMission({ characterId, lastMissionId: missionId });

      // API 명세상 거절과 다음 미션 요청은 별도 endpoint라 한 mutation 안에서 순서를 보장한다.
      return { rejection, nextMission };
    },
    onSuccess: async ({ nextMission }, variables) => {
      queryClient.setQueryData(
        missionQueryKeys.todayFocus(variables.characterId),
        normalizeCurrentMission(nextMission),
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: missionQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: walletQueryKeys.all }),
      ]);
    },
  });
}

export function useSubmitMissionCompletionAnswerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ missionId, answer }: { missionId: number; answer: string }) =>
      submitMissionCompletionAnswer(missionId, { answer }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: missionQueryKeys.all }),
      ]);
    },
  });
}
