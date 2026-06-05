import { create } from "zustand";

import { type CharacterGrowth, type CharacterKey } from "@/entities/character/types";
import {
  type CurrentMissionResponse,
  type MissionCompletionQuestionResponse,
  type MissionCompletionResultResponse,
} from "@/entities/mission/types";

type MissionFlowCharacter = {
  id: number;
  key: CharacterKey;
  name: string;
  growth?: CharacterGrowth | null;
};

type MissionFlowState = {
  activeMission: CurrentMissionResponse | null;
  character: MissionFlowCharacter | null;
  completionQuestion: MissionCompletionQuestionResponse | null;
  completionResult: MissionCompletionResultResponse | null;
  setActiveMission: (mission: CurrentMissionResponse, character: MissionFlowCharacter) => void;
  setCompletionQuestion: (question: MissionCompletionQuestionResponse) => void;
  setCompletionResult: (result: MissionCompletionResultResponse) => void;
  clearMissionFlow: () => void;
};

/**
 * 현재 미션 완료 플로우에서만 필요한 임시 상태를 담는 store입니다.
 * 미션 카드, 답변 화면, 결과 화면이 같은 미션/캐릭터/질문/결과를 공유하도록 합니다.
 */
export const useMissionFlowStore = create<MissionFlowState>((set) => ({
  activeMission: null,
  character: null,
  completionQuestion: null,
  completionResult: null,
  setActiveMission: (mission, character) =>
    set({
      activeMission: mission,
      character,
      completionQuestion: null,
      completionResult: null,
    }),
  setCompletionQuestion: (question) => set({ completionQuestion: question }),
  setCompletionResult: (result) => set({ completionResult: result }),
  // 완료 결과 화면을 벗어난 뒤에는 다음 미션 플로우에 이전 답변이 섞이지 않게 비운다.
  clearMissionFlow: () =>
    set({
      activeMission: null,
      character: null,
      completionQuestion: null,
      completionResult: null,
    }),
}));
