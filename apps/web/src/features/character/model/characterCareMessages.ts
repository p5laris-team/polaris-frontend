import { type CharacterKey } from "@/entities/character/types";
import { type CareActionType } from "@/features/character/model/characterCareTypes";

type CharacterCareMessageSet = {
  intro: string;
  itemShortage: (itemLabel: string) => string;
  reactions: Record<CareActionType, string>;
};

const characterCareMessages: Record<CharacterKey, CharacterCareMessageSet> = {
  mumu: {
    intro: "무무 무! (해석: 오늘 컨디션을 같이 살펴볼까요?)",
    itemShortage: (itemLabel) => `무... 무무. (해석: ${itemLabel}이 아직 없어요.)`,
    reactions: {
      FEED: "무무... 무! (해석: 별사탕밥이 반짝하고 들어왔어요.)",
      SLEEP: "무우... 무무. (해석: 구름 베개가 폭신해서 기운이 돌아와요.)",
      PLAY: "무! 무무무! (해석: 별 장난감이 마음을 톡톡 건드렸어요.)",
    },
  },
  nova: {
    intro: "오늘의 빛이 어떤지 천천히 살펴볼까요?",
    itemShortage: (itemLabel) => `${itemLabel}이 아직 별가방에 없어요.`,
    reactions: {
      FEED: "따뜻한 별맛이에요. 조금 더 빛날 수 있겠어요.",
      SLEEP: "잠깐 눈을 감으면 궤도가 고요해져요.",
      PLAY: "작은 놀이가 별빛을 살짝 흔들었어요.",
    },
  },
  jjori: {
    intro: "좋아. 오늘 컨디션 점검 들어간다!",
    itemShortage: (itemLabel) => `${itemLabel} 재고 0개. 이건 못 속임.`,
    reactions: {
      FEED: "좋아. 별사탕밥 충전 완료!",
      SLEEP: "구름 베개 접수. 3초 안에 말랑해질 예정.",
      PLAY: "별 장난감? 이건 못 참지. 한 판 더!",
    },
  },
};

export function getCharacterCareIntro(characterKey: CharacterKey) {
  return characterCareMessages[characterKey].intro;
}

export function getCharacterCareItemShortageMessage(
  characterKey: CharacterKey,
  itemLabel: string,
) {
  return characterCareMessages[characterKey].itemShortage(itemLabel);
}

export function getCharacterCareReactionMessage(
  characterKey: CharacterKey,
  actionType: CareActionType,
  fallbackMessage: string,
) {
  return characterCareMessages[characterKey].reactions[actionType] ?? fallbackMessage;
}
