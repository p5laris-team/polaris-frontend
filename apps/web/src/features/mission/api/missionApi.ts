import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
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
} from "@/entities/mission/types";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

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

export function useStartMissionCompletionSessionMutation() {
  return useMutation({
    mutationFn: startMissionCompletionSession,
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeQueryKeys.all });
    },
  });
}

export function useSubmitMissionCompletionAnswerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ missionId, answer }: { missionId: number; answer: string }) =>
      submitMissionCompletionAnswer(missionId, { answer }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeQueryKeys.all });
    },
  });
}
