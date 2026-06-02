/**
 * 미션 조회, 다음 미션 요청, 거절, 완료 질문 시작, 완료 답변 제출을 담당하는 API 계층입니다.
 * 홈/미션 목록/답변/결과 화면이 모두 이 파일의 hook을 통해 같은 서버 상태를 공유합니다.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getDemoHomeResponse,
  demoGetTodayMissions,
  demoGetMissionDetail,
  demoGetMissionHistory,
  demoUpsertMissionFeedback,
  demoRejectMission,
  demoRequestNextMission,
  demoStartCompletionSession,
  demoSubmitCompletionAnswer,
} from "@/features/home/model/homeFixture";
import { homeQueryKeys } from "@/features/home/api/homeApi";
import {
  type CurrentMissionResponse,
  type MissionDetailResponse,
  type MissionFeedbackResponse,
  type MissionCompletionQuestionResponse,
  type MissionCompletionResultResponse,
  type MissionRejectionResponse,
  type RequestNextMissionRequest,
  type SubmitMissionCompletionAnswerRequest,
  type TodayMissionsResponse,
  type UpsertMissionFeedbackRequest,
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
  history: (date: string) => [...missionQueryKeys.all, "history", date] as const,
  detail: (missionId: number | undefined) =>
    [...missionQueryKeys.all, "detail", missionId ?? "none"] as const,
};

function normalizeCurrentMission(
  mission: CurrentMissionResponse | null | undefined,
): CurrentMissionResponse | null {
  // 백엔드가 빈 미션을 0 또는 null 형태로 줄 수 있어 화면에서는 null로 통일한다.
  if (!mission || !mission.id || mission.id <= 0) {
    return null;
  }

  return mission;
}

/** 현재 진행 중인 미션 1개를 조회합니다. 없으면 null로 정규화합니다. */
export async function getCurrentMission() {
  if (runtimeConfig.useApiFixtures) {
    return normalizeCurrentMission(getDemoHomeResponse().currentMission);
  }

  const mission = await unwrapApiResponse<CurrentMissionResponse>(
    apiClient.get("/api/mission/v1/missions/current"),
  );

  return normalizeCurrentMission(mission);
}

/** 오늘 생성된 미션 스택과 상태를 조회합니다. */
export function getTodayMissions() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetTodayMissions());
  }

  return unwrapApiResponse<TodayMissionsResponse>(
    apiClient.get("/api/mission/v1/missions/today"),
  );
}

/** 특정 날짜의 미션 기록을 조회합니다. */
export function getMissionHistory(date: string) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetMissionHistory(date));
  }

  return unwrapApiResponse<TodayMissionsResponse>(
    apiClient.get("/api/mission/v1/missions/history", {
      params: { date },
    }),
  );
}

/** 미션 1개의 설명, 완료 질문, 답변 전문을 조회합니다. */
export function getMissionDetail(missionId: number) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetMissionDetail(missionId));
  }

  return unwrapApiResponse<MissionDetailResponse>(
    apiClient.get(`/api/mission/v1/missions/${missionId}`),
  );
}

/** 완료 만족도 또는 거절 이유 피드백을 저장합니다. */
export function upsertMissionFeedback(missionId: number, body: UpsertMissionFeedbackRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoUpsertMissionFeedback(missionId, body));
  }

  return unwrapApiResponse<MissionFeedbackResponse>(
    apiClient.post(`/api/mission/v1/missions/${missionId}/feedback`, body),
  );
}

/** 완료 답변을 받기 전, 사용자에게 보여 줄 질문 세션을 시작합니다. */
export function startMissionCompletionSession(missionId: number) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoStartCompletionSession(missionId));
  }

  return unwrapApiResponse<MissionCompletionQuestionResponse>(
    apiClient.post(`/api/mission/v1/missions/${missionId}/completion-sessions`, {}),
  );
}

/** 현재 제안된 미션을 거절 처리합니다. */
export function rejectMission(missionId: number) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoRejectMission(missionId));
  }

  return unwrapApiResponse<MissionRejectionResponse>(
    apiClient.post(`/api/mission/v1/missions/${missionId}/rejections`, {}),
  );
}

/** 현재 진행 미션이 없을 때 다음 미션 하나를 요청합니다. */
export function requestNextMission(body: RequestNextMissionRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoRequestNextMission(body));
  }

  return unwrapApiResponse<CurrentMissionResponse>(
    apiClient.post("/api/mission/v1/missions/today-focus/next", body),
  );
}

/**
 * 홈 화면 진입 시 현재 미션이 있으면 그대로 쓰고, 없으면 다음 미션을 요청합니다.
 * 이미 활성 미션이 있다는 백엔드 경합 응답은 다시 조회로 흡수합니다.
 */
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

      if (error.apiError.code === "MISSION_REJECT_LIMIT_EXCEEDED") {
        return null;
      }
    }

    throw error;
  }
}

/** 완료 답변을 제출하고 보상/결과 응답을 받아옵니다. */
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

/** 홈의 현재 미션 카드가 사용하는 조회 hook입니다. */
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

/** 미션 히스토리 화면에서 오늘의 전체 미션 스택을 조회합니다. */
export function useTodayMissionsQuery() {
  return useQuery({
    queryKey: missionQueryKeys.today(),
    queryFn: getTodayMissions,
  });
}

/** 날짜별 미션 기록 화면에서 사용하는 조회 hook입니다. */
export function useMissionHistoryQuery(date: string) {
  return useQuery({
    queryKey: missionQueryKeys.history(date),
    queryFn: () => getMissionHistory(date),
  });
}

/** 미션 상세 화면에서 질문/답변 전문을 조회하는 hook입니다. */
export function useMissionDetailQuery(missionId: number | undefined) {
  return useQuery({
    queryKey: missionQueryKeys.detail(missionId),
    queryFn: () => {
      if (!missionId) {
        throw new Error("미션을 찾지 못했어요.");
      }

      return getMissionDetail(missionId);
    },
    enabled: Boolean(missionId),
  });
}

/** 완료 질문 시작 후 미션 관련 캐시를 갱신합니다. */
export function useStartMissionCompletionSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startMissionCompletionSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: missionQueryKeys.all });
    },
  });
}

/** 미션 거절과 다음 미션 요청을 하나의 사용자 액션으로 묶어 처리합니다. */
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

/** 완료 답변 제출 후 홈/미션 캐시를 갱신합니다. */
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

/** 미션 완료/거절 후 사용자의 가벼운 피드백을 저장합니다. */
export function useUpsertMissionFeedbackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      missionId,
      body,
    }: {
      missionId: number;
      body: UpsertMissionFeedbackRequest;
    }) => upsertMissionFeedback(missionId, body),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: missionQueryKeys.detail(variables.missionId) }),
        queryClient.invalidateQueries({ queryKey: missionQueryKeys.all }),
      ]);
    },
  });
}

export function getMissionLimitMessage(code: string | undefined) {
  if (code === "MISSION_DAILY_LIMIT_EXCEEDED") {
    return "오늘 제안 가능한 미션을 모두 만났어요. 내일 다시 작은 별을 찾아볼게요.";
  }

  if (code === "MISSION_REJECT_LIMIT_EXCEEDED") {
    return "오늘은 더 이상 미션을 바꾸기 어려워요. 마음에 드는 미션을 천천히 골라봐요.";
  }

  return null;
}
