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

const categoryToViewKey: Record<string, CategoryKey> = {
  BASIC_ROUTINE: "morning",
  SPACE_RESET: "mind",
  FITNESS: "fitness",
  OUTDOOR: "fitness",
  READING: "reading",
  MIND: "mind",
};

function toDifficultyLabel(difficulty: string) {
  if (difficulty === "EASY") return "쉬움";
  if (difficulty === "NORMAL") return "보통";
  return "도전";
}

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
