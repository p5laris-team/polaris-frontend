import { toCharacterKey, type CharacterStatusValue } from "@/entities/character/types";
import { type HomeResponse } from "@/entities/home/types";
import { type CharacterMood } from "@/shared/assets/polarisAssets";

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
};

function toGaugeTone(state: CharacterStatusValue | null | undefined): GaugeTone {
  if (!state) return "normal";
  if (state.grade === "GOOD") return "good";
  if (state.grade === "BAD") return "bad";
  return "normal";
}

function toMood(states: NonNullable<HomeResponse["character"]>["states"]): CharacterMood {
  if (!states) return "idle";
  if (states.energy.grade === "BAD") return "sleepy";
  if (states.affection.grade === "GOOD") return "happy";
  return "idle";
}

export function mapHomeResponseToViewModel(response: HomeResponse): HomeScreenViewModel | null {
  const character = response.character;
  const states = character?.states;

  if (!character || !states) {
    return null;
  }

  return {
    nickname: response.user.nickname,
    walletStarPiece: response.wallet.starPiece,
    unreadNotificationCount: response.notifications.unreadCount,
    character: {
      id: character.id,
      key: toCharacterKey(character.characterTypeCode),
      mood: toMood(states),
      name: character.name,
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
  };
}
