/**
 * 온보딩 질문 조회와 사용자 온보딩 프로필 저장을 담당하는 API 계층입니다.
 * 백엔드 enum key와 프론트 camelCase key를 맞추는 변환도 이 파일에서 처리합니다.
 */
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  type OnboardingProfileResponse,
  type OnboardingQuestion,
  type OnboardingQuestionsResponse,
  type SaveOnboardingProfileRequest,
  type SaveOnboardingProfileResponse,
  type OnboardingQuestionKey,
} from "@/features/onboarding/model/onboardingTypes";
import {
  demoGetOnboardingProfile,
  demoOnboardingQuestions,
  demoSaveOnboardingProfile,
} from "@/features/onboarding/model/onboardingFixtures";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

export const onboardingQueryKeys = {
  all: ["onboarding"] as const,
  questions: () => [...onboardingQueryKeys.all, "questions"] as const,
  profile: () => [...onboardingQueryKeys.all, "profile"] as const,
};

/** 백엔드 질문 목록을 화면에서 쓰는 질문/선택지 형태로 변환해 반환합니다. */
export async function getOnboardingQuestions(): Promise<OnboardingQuestionsResponse> {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoOnboardingQuestions);
  }

  const rawQuestions = await unwrapApiResponse<
    Array<{
      key: string;
      content: string;
      options: Array<{ key: string; value: string }>;
      multipleSelection: boolean;
      maxSelectionCount: number;
    }>
  >(
    apiClient.get("/api/onboarding/v1/questions"),
  );

  const items = rawQuestions.map((q) => {
    const keyMap: Record<string, OnboardingQuestionKey> = {
      PREFERRED_MISSION_TIME: "preferredMissionTime",
      ROUTINE_GOAL: "routineGoal",
      MISSION_INTENSITY: "missionIntensity",
      MISSION_PLACE_CONTEXT: "missionPlaceContext",
      AVOIDED_MISSION_TAGS: "avoidedMissionTags",
    };

    const key = keyMap[q.key] || (q.key as OnboardingQuestionKey);

    const options = (q.options || []).map((opt) => {
      const optionValue = opt.key;
      const optionLabel = opt.value;

      const matchedFixtureQuestion = demoOnboardingQuestions.items.find(
        (fq) => fq.key === key
      );
      const matchedFixtureOption = matchedFixtureQuestion?.options.find(
        (fo) => fo.value === optionValue
      );

      return {
        value: optionValue,
        label: optionLabel,
        sub: matchedFixtureOption?.sub,
      };
    });

    const matchedFixtureQuestion = demoOnboardingQuestions.items.find(
      (fq) => fq.key === key
    );

    return {
      key,
      question: q.content,
      type: q.multipleSelection ? "MULTI_CHOICE" : "SINGLE_CHOICE",
      options,
      characterLine: matchedFixtureQuestion?.characterLine || "무... 다음 질문이에요.",
      multipleSelection: q.multipleSelection,
      maxSelectionCount: q.maxSelectionCount,
    } satisfies OnboardingQuestion;
  });

  return { items };
}

/** 현재 로그인 사용자의 온보딩 완료 여부와 저장된 답변을 조회합니다. */
export function getOnboardingProfile() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetOnboardingProfile());
  }

  return unwrapApiResponse<OnboardingProfileResponse>(
    apiClient.get("/api/onboarding/v1/profiles/me"),
  );
}

/** 온보딩 답변을 백엔드 프로필로 저장합니다. answers 객체는 JSON 문자열로 변환합니다. */
export function saveOnboardingProfile(body: SaveOnboardingProfileRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoSaveOnboardingProfile(body));
  }

  const backendBody = {
    ...body,
    answersJson: JSON.stringify(body.answers),
  };

  return unwrapApiResponse<SaveOnboardingProfileResponse>(
    apiClient.put("/api/onboarding/v1/profiles/me", backendBody),
  );
}

/** 온보딩 설문 화면에서 질문 목록을 조회하는 hook입니다. */
export function useOnboardingQuestionsQuery() {
  return useQuery({
    queryKey: onboardingQueryKeys.questions(),
    queryFn: getOnboardingQuestions,
  });
}

/** 앱 초기화나 마이페이지에서 온보딩 프로필을 확인할 때 사용하는 hook입니다. */
export function useOnboardingProfileQuery() {
  return useQuery({
    queryKey: onboardingQueryKeys.profile(),
    queryFn: getOnboardingProfile,
  });
}

/** 설문 완료 시 온보딩 프로필을 저장하는 mutation hook입니다. */
export function useSaveOnboardingProfileMutation() {
  return useMutation({
    mutationFn: saveOnboardingProfile,
  });
}
