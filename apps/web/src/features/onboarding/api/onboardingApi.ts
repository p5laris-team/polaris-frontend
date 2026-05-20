import { useMutation, useQuery } from "@tanstack/react-query";

import {
  type OnboardingProfileResponse,
  type OnboardingQuestionsResponse,
  type SaveOnboardingProfileRequest,
  type SaveOnboardingProfileResponse,
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

export function getOnboardingQuestions() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoOnboardingQuestions);
  }

  return unwrapApiResponse<OnboardingQuestionsResponse>(
    apiClient.get("/api/onboarding/v1/questions"),
  );
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

  return unwrapApiResponse<SaveOnboardingProfileResponse>(
    apiClient.put("/api/onboarding/v1/profiles/me", body),
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
