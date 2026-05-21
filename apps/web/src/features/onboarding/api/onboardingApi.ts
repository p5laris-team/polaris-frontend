import { useMutation, useQuery } from "@tanstack/react-query";

import {
  type OnboardingProfileResponse,
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

export async function getOnboardingQuestions(): Promise<OnboardingQuestionsResponse> {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoOnboardingQuestions);
  }

  const rawQuestions = await unwrapApiResponse<any[]>(
    apiClient.get("/api/onboarding/v1/questions"),
  );

  const items = rawQuestions.map((q) => {
    const keyMap: Record<string, OnboardingQuestionKey> = {
      LIVING_TYPE: "livingType",
      WAKE_UP_TIME: "wakeUpTime",
      SLEEP_TIME: "sleepTime",
      PREFERRED_MISSION_TIME: "preferredMissionTime",
      ROUTINE_GOAL: "routineGoal",
      MISSION_INTENSITY: "missionIntensity",
      ACTIVITY_PREFERENCE: "activityPreference",
    };

    const key = keyMap[q.key] || (q.key as OnboardingQuestionKey);

    const options = (q.options || []).map((opt: any) => {
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
      type: "SINGLE_CHOICE" as const,
      options,
      characterLine: matchedFixtureQuestion?.characterLine || "무... 다음 질문이에요.",
    };
  });

  return { items };
}

export function getOnboardingProfile() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetOnboardingProfile());
  }

  return unwrapApiResponse<OnboardingProfileResponse>(
    apiClient.get("/api/onboarding/v1/profiles/me"),
  );
}

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

export function useOnboardingQuestionsQuery() {
  return useQuery({
    queryKey: onboardingQueryKeys.questions(),
    queryFn: getOnboardingQuestions,
  });
}

export function useOnboardingProfileQuery() {
  return useQuery({
    queryKey: onboardingQueryKeys.profile(),
    queryFn: getOnboardingProfile,
  });
}

export function useSaveOnboardingProfileMutation() {
  return useMutation({
    mutationFn: saveOnboardingProfile,
  });
}
