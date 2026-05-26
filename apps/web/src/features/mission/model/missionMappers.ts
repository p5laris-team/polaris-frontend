/**
 * 미션 API 응답을 홈 화면 전용 view model로 바꾸는 mapper입니다.
 * API 필드 이름과 화면 라벨/asset key가 다르기 때문에 UI 컴포넌트 앞에서 한 번 정리합니다.
 */
import { type CurrentMissionResponse } from "@/entities/mission/types";
import { type CategoryKey } from "@/shared/assets/polarisAssets";

export type HomeMissionViewModel = {
  id: number;
  title: string;
  description: string;
  category: CategoryKey;
  difficultyLabel: string;
  rewardStarPiece: number;
  stackLabel: string;
};

// 백엔드 미션 카테고리를 프론트 카테고리 아이콘 key로 연결합니다.
const categoryToViewKey: Record<string, CategoryKey> = {
  BASIC_ROUTINE: "morning",
  SPACE_RESET: "mind",
  FITNESS: "fitness",
  OUTDOOR: "fitness",
  READING: "reading",
  MIND: "mind",
};

/** 백엔드 난이도 enum을 홈 카드의 한국어 난이도 라벨로 바꿉니다. */
function toDifficultyLabel(difficulty: string) {
  if (difficulty === "EASY") return "쉬움";
  if (difficulty === "NORMAL") return "보통";
  return "도전";
}

/** 현재 미션 응답을 홈 미션 카드가 바로 사용할 수 있는 view model로 변환합니다. */
export function mapCurrentMissionToHomeMission(
  mission: CurrentMissionResponse | null | undefined,
): HomeMissionViewModel | null {
  if (!mission) {
    return null;
  }

  return {
    id: mission.id,
    title: mission.title,
    description: mission.description,
    category: categoryToViewKey[mission.category] ?? "mind",
    difficultyLabel: toDifficultyLabel(mission.difficulty),
    rewardStarPiece: mission.rewardStarPiece,
    stackLabel: `오늘 ${mission.stackOrder} / 15`,
  };
}
