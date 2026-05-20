import { toCharacterKey, type CharacterStatusValue } from "@/entities/character/types";
import { type HomeResponse } from "@/entities/home/types";
import { type CategoryKey, type CharacterMood } from "@/shared/assets/polarisAssets";

type GaugeTone = "good" | "normal" | "bad";

type HomeGauge = {
  key: "hunger" | "energy" | "affection";
  label: string;
  value: number;
  description: string;
  tone: GaugeTone;
};

export type HomeScreenViewModel = {
  nickname: string;
  walletStarPiece: number;
  unreadNotificationCount: number;
  character: {
    id: number;
    key: ReturnType<typeof toCharacterKey>;
    mood: CharacterMood;
    name: string;
    bubble: string;
    gauges: HomeGauge[];
  };
  mission: {
    id: number;
    title: string;
    description: string;
    category: CategoryKey;
    difficultyLabel: string;
    rewardStarPiece: number;
    stackLabel: string;
  } | null;
};

const categoryToViewKey: Record<string, CategoryKey> = {
  BASIC_ROUTINE: "morning",
  SPACE_RESET: "mind",
  FITNESS: "fitness",
  READING: "reading",
  MIND: "mind",
};

function toGaugeTone(state: CharacterStatusValue): GaugeTone {
  if (state.grade === "GOOD") return "good";
  if (state.grade === "BAD") return "bad";
  return "normal";
}

function toMood(states: HomeResponse["character"]["states"]): CharacterMood {
  if (states.energy.grade === "BAD") return "sleepy";
  if (states.affection.grade === "GOOD") return "happy";
  return "idle";
}

function toDifficultyLabel(difficulty: string) {
  if (difficulty === "EASY") return "쉬움";
  if (difficulty === "NORMAL") return "보통";
  return "도전";
}

export function mapHomeResponseToViewModel(response: HomeResponse): HomeScreenViewModel {
  const states = response.character.states;

  return {
    nickname: response.user.nickname,
    walletStarPiece: response.wallet.starPiece,
    unreadNotificationCount: response.notifications.unreadCount,
    character: {
      id: response.character.id,
      key: toCharacterKey(response.character.characterTypeCode),
      mood: toMood(states),
      name: response.character.name,
      bubble:
        response.currentMission?.characterMessage ??
        "오늘 미션은 여기까지예요. 내일 또 작은 별을 찾아봐요.",
      // API의 hunger/energy/affection을 화면 라벨과 게이지 톤으로 한 번 변환해서 UI에 넘긴다.
      gauges: [
        {
          key: "hunger",
          label: "포만감",
          value: states.hunger.value,
          description: states.hunger.label,
          tone: toGaugeTone(states.hunger),
        },
        {
          key: "energy",
          label: "기운",
          value: states.energy.value,
          description: states.energy.label,
          tone: toGaugeTone(states.energy),
        },
        {
          key: "affection",
          label: "애정",
          value: states.affection.value,
          description: states.affection.label,
          tone: toGaugeTone(states.affection),
        },
      ],
    },
    mission: response.currentMission
      ? {
          id: response.currentMission.id,
          title: response.currentMission.title,
          description: response.currentMission.description,
          category: categoryToViewKey[response.currentMission.category] ?? "mind",
          difficultyLabel: toDifficultyLabel(response.currentMission.difficulty),
          rewardStarPiece: response.currentMission.rewardStarPiece,
          stackLabel: `오늘 ${response.currentMission.stackOrder} / 15`,
        }
      : null,
  };
}
