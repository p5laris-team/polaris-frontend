/**
 * 홈 API 응답을 홈 화면 전용 view model로 바꾸는 mapper입니다.
 * 서버 응답 구조를 그대로 화면에 흘리지 않고, 라벨/톤/캐릭터 key를 한 번 정리해 UI를 단순하게 만듭니다.
 */
import { toCharacterKey, type CharacterStatusValue } from "@/entities/character/types";
import { type HomeResponse } from "@/entities/home/types";
import { type CharacterMood } from "@/shared/assets/polarisAssets";

type GaugeTone = "good" | "normal" | "bad";

/** 홈 게이지 컴포넌트가 바로 쓰는 상태 값입니다. */
type HomeGauge = {
  key: "hunger" | "energy" | "affection";
  label: string;
  value: number;
  description: string;
  tone: GaugeTone;
};

/** HomePage에서 사용하는 최종 화면 모델입니다. */
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

/** 캐릭터 상태 등급을 게이지 색상 톤으로 변환합니다. */
function toGaugeTone(state: CharacterStatusValue | null | undefined): GaugeTone {
  if (!state) return "normal";
  if (state.grade === "GOOD") return "good";
  if (state.grade === "BAD") return "bad";
  return "normal";
}

/** 캐릭터 상태를 홈에서 대표로 보여줄 mood로 변환합니다. */
function toMood(states: NonNullable<HomeResponse["character"]>["states"]): CharacterMood {
  if (!states) return "idle";
  if (states.energy.grade === "BAD") return "sleepy";
  if (states.affection.grade === "GOOD") return "happy";
  return "idle";
}

/** 홈 API 응답을 화면 모델로 변환하고, 캐릭터/상태가 없으면 홈을 그리지 않도록 null을 반환합니다. */
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
