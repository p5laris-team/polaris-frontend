import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  type CharacterTypeSummary,
  type CreatedCharacterResponse,
  type OnboardingAnswerValue,
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
  setAnswer: (key: OnboardingQuestionKey, value: OnboardingAnswerValue) => void;
  markCompleted: () => void;
  resetFlow: () => void;
};

/**
 * 온보딩 진행 중 선택한 캐릭터, 이름, 설문 답변을 저장하는 전역 store입니다.
 * 사용자가 새로고침해도 온보딩 흐름을 이어갈 수 있게 localStorage에 유지합니다.
 */
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
