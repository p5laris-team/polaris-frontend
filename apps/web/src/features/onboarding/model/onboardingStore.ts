import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  type CharacterTypeSummary,
  type CreatedCharacterResponse,
  type OnboardingAnswers,
  type OnboardingQuestionKey,
} from "@/features/onboarding/model/onboardingTypes";

type OnboardingSetupState = {
  selectedCharacter: CharacterTypeSummary | null;
  createdCharacter: CreatedCharacterResponse | null;
  answers: OnboardingAnswers;
  completed: boolean;
  selectCharacter: (character: CharacterTypeSummary) => void;
  setCreatedCharacter: (character: CreatedCharacterResponse) => void;
  setAnswer: (key: OnboardingQuestionKey, value: string) => void;
  markCompleted: () => void;
  resetFlow: () => void;
};

export const useOnboardingSetupStore = create<OnboardingSetupState>()(
  persist(
    (set) => ({
      selectedCharacter: null,
      createdCharacter: null,
      answers: {},
      completed: false,
      selectCharacter: (character) => set({ selectedCharacter: character }),
      setCreatedCharacter: (character) => set({ createdCharacter: character }),
      setAnswer: (key, value) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [key]: value,
          },
        })),
      markCompleted: () => set({ completed: true }),
      // 개발 fixture 로그인마다 신규 유저 첫 진입 흐름을 다시 확인할 수 있게 비운다.
      resetFlow: () =>
        set({
          selectedCharacter: null,
          createdCharacter: null,
          answers: {},
          completed: false,
        }),
    }),
    {
      name: "polaris-web-onboarding",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
