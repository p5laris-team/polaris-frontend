import { type HomeResponse } from "@/entities/home/types";
import {
  type CharacterStates,
  type CharacterStatusValue,
  type CharacterTypeCode,
} from "@/entities/character/types";
import {
  type CurrentMissionResponse,
  type MissionCompletionQuestionResponse,
  type MissionCompletionResultResponse,
  type MissionRejectionResponse,
  type RequestNextMissionRequest,
} from "@/entities/mission/types";

const missionTemplates: CurrentMissionResponse[] = [
  {
    id: 100,
    missionDate: "2026-05-20",
    stackOrder: 3,
    title: "창문 열고 숨 고르기",
    description: "지금 자리에서 창문을 열고 공기를 한 번 바꿔보세요.",
    characterMessage: "무... 오늘의 작은 별을 찾은 것 같아요.",
    category: "BASIC_ROUTINE",
    difficulty: "EASY",
    rewardStarPiece: 10,
    status: "OFFERED",
  },
  {
    id: 101,
    missionDate: "2026-05-20",
    stackOrder: 4,
    title: "책상 위 물건 하나 치우기",
    description: "눈에 보이는 물건 하나만 제자리로 옮겨보세요.",
    characterMessage: "무... 공간이 조금 숨을 쉬게 될 것 같아요.",
    category: "SPACE_RESET",
    difficulty: "EASY",
    rewardStarPiece: 10,
    status: "OFFERED",
  },
  {
    id: 102,
    missionDate: "2026-05-20",
    stackOrder: 5,
    title: "좋았던 문장 저장하기",
    description: "읽던 글이나 떠오른 생각에서 한 줄만 남겨보세요.",
    characterMessage: "무... 문장도 별조각처럼 남을 수 있대요.",
    category: "READING",
    difficulty: "EASY",
    rewardStarPiece: 12,
    status: "OFFERED",
  },
];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const careActionCost = {
  FEED: 3,
  SLEEP: 0,
  PLAY: 2,
} as const;

type DemoCareActionType = keyof typeof careActionCost;

const initialHomeResponse: HomeResponse = {
  user: {
    id: 1,
    nickname: "별따라걷기",
  },
  wallet: {
    starPiece: 240,
  },
  character: {
    id: 10,
    name: "작은무무",
    characterTypeCode: "MUMU",
    currentAssetUrl: "https://cdn.polaris.app/mumu/idle.png",
    states: {
      hunger: { value: 80, label: "든든함", grade: "GOOD" },
      energy: { value: 55, label: "졸림", grade: "NORMAL" },
      affection: { value: 68, label: "가까움", grade: "GOOD" },
    },
  },
  currentMission: missionTemplates[0],
  notifications: {
    unreadCount: 2,
  },
};

let demoHomeState = clone(initialHomeResponse);
let lastClosedMissionStackOrder = initialHomeResponse.currentMission?.stackOrder ?? 3;

export function getDemoHomeResponse() {
  return clone(demoHomeState);
}

export function getDemoActiveCharacter() {
  return clone(demoHomeState.character);
}

export function getDemoWalletStarPiece() {
  return demoHomeState.wallet.starPiece;
}

export function demoApplyCreatedCharacter({
  id,
  name,
  characterTypeCode,
}: {
  id: number;
  name: string;
  characterTypeCode: CharacterTypeCode;
}) {
  // 온보딩 fixture에서 만든 캐릭터를 홈 fixture에도 반영해 최초 진입 흐름이 이어져 보이게 한다.
  demoHomeState.character = {
    ...demoHomeState.character,
    id,
    name,
    characterTypeCode,
    currentAssetUrl: `https://cdn.polaris.app/${characterTypeCode.toLowerCase()}/idle.png`,
  };
}

export function demoCareForCharacter(actionType: DemoCareActionType) {
  const cost = careActionCost[actionType];

  if (demoHomeState.wallet.starPiece < cost) {
    throw new Error("별조각이 부족해요. 미션을 완료해서 별조각을 모아봐요!");
  }

  const beforeStates = toNumericStates(demoHomeState.character.states);
  const nextStates = applyCareToStates(beforeStates, actionType);

  demoHomeState.wallet.starPiece -= cost;
  demoHomeState.character.states = toCharacterStates(nextStates);

  return {
    beforeStates,
    afterStates: nextStates,
    starPiece: demoHomeState.wallet.starPiece,
  };
}

export function demoApplyAttendanceReward({
  rewardStarPiece,
  affection = 3,
}: {
  rewardStarPiece: number;
  affection?: number;
}) {
  // SCR-019 fixture 출석 보상은 홈의 별조각과 캐릭터 애정도에 바로 반영해 화면 간 상태를 이어준다.
  const nextAffection = clampStatus(demoHomeState.character.states.affection.value + affection);

  demoHomeState.wallet.starPiece += rewardStarPiece;
  demoHomeState.character.states.affection = toStatusValue("affection", nextAffection);

  return {
    starPiece: demoHomeState.wallet.starPiece,
    affection: nextAffection,
  };
}

export function demoApplyItemPurchase({ price }: { price: number }) {
  if (demoHomeState.wallet.starPiece < price) {
    throw new Error("별조각이 부족해요. 미션을 완료해서 별조각을 모아봐요!");
  }

  // SCR-013 fixture 구매는 홈 지갑을 함께 차감해 상점과 홈의 별조각 숫자가 어긋나지 않게 한다.
  demoHomeState.wallet.starPiece -= price;

  return {
    starPiece: demoHomeState.wallet.starPiece,
  };
}

export function demoStartCompletionSession(missionId: number): MissionCompletionQuestionResponse {
  const mission = demoHomeState.currentMission;

  if (!mission || mission.id !== missionId) {
    throw new Error("현재 진행 중인 미션을 찾지 못했어요.");
  }

  // 완료 버튼 이후에는 보상을 바로 지급하지 않고 ANSWERING 상태와 질문 1개만 만든다.
  demoHomeState.currentMission = { ...mission, status: "ANSWERING" };

  return {
    missionId,
    status: "ANSWERING",
    question: {
      id: 501,
      text: "방금 미션을 해내면서 어떤 점이 제일 기억에 남았나요?",
      inputType: "TEXT",
      minLength: 1,
      maxLength: 300,
    },
  };
}

function applyCareToStates(
  states: Record<keyof CharacterStates, number>,
  actionType: DemoCareActionType,
) {
  if (actionType === "FEED") {
    return {
      ...states,
      hunger: clampStatus(states.hunger + 30),
    };
  }

  if (actionType === "SLEEP") {
    return {
      ...states,
      energy: clampStatus(states.energy + 30),
    };
  }

  return {
    ...states,
    affection: clampStatus(states.affection + 25),
  };
}

function toNumericStates(states: CharacterStates): Record<keyof CharacterStates, number> {
  return {
    hunger: states.hunger.value,
    energy: states.energy.value,
    affection: states.affection.value,
  };
}

function toCharacterStates(states: Record<keyof CharacterStates, number>): CharacterStates {
  return {
    hunger: toStatusValue("hunger", states.hunger),
    energy: toStatusValue("energy", states.energy),
    affection: toStatusValue("affection", states.affection),
  };
}

function toStatusValue(kind: keyof CharacterStates, value: number): CharacterStatusValue {
  const clamped = clampStatus(value);
  const grade = clamped <= 30 ? "BAD" : clamped <= 70 ? "NORMAL" : "GOOD";

  return {
    value: clamped,
    label: getStatusLabel(kind, clamped),
    grade,
  };
}

function getStatusLabel(kind: keyof CharacterStates, value: number) {
  if (kind === "hunger") {
    if (value <= 30) return "배고파요";
    if (value <= 70) return "배불러요";
    return "완전 배불러요";
  }

  if (kind === "energy") {
    if (value <= 30) return "피곤해요";
    if (value <= 70) return "괜찮아요";
    return "활기차요";
  }

  if (value <= 30) return "쓸쓸해요";
  if (value <= 70) return "좋아요";
  return "너무 좋아요";
}

function clampStatus(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function demoRejectMission(missionId: number): MissionRejectionResponse {
  const mission = demoHomeState.currentMission;

  if (!mission || mission.id !== missionId) {
    throw new Error("거절할 수 있는 현재 미션이 없어요.");
  }

  demoHomeState.currentMission = null;
  lastClosedMissionStackOrder = mission.stackOrder;

  return {
    missionId,
    status: "REJECTED",
    rejectedAt: new Date().toISOString(),
    characterMessage: "괜찮아요. 다른 별을 찾아볼게요.",
  };
}

export function demoRequestNextMission(body: RequestNextMissionRequest): CurrentMissionResponse {
  const lastOrder =
    missionTemplates.find((mission) => mission.id === body.lastMissionId)?.stackOrder ??
    demoHomeState.currentMission?.stackOrder ??
    lastClosedMissionStackOrder;
  const nextOrder = Math.min(lastOrder + 1, 15);
  const template = missionTemplates[(nextOrder - 3) % missionTemplates.length];
  const nextMission = {
    ...template,
    id: 100 + nextOrder,
    stackOrder: nextOrder,
    status: "OFFERED",
  } satisfies CurrentMissionResponse;

  demoHomeState.currentMission = nextMission;
  lastClosedMissionStackOrder = nextMission.stackOrder;

  return clone(nextMission);
}

export function demoSubmitCompletionAnswer(
  missionId: number,
  answer: string,
): MissionCompletionResultResponse {
  const mission = demoHomeState.currentMission;
  const trimmedAnswer = answer.trim();

  if (!mission || mission.id !== missionId) {
    throw new Error("답변할 수 있는 현재 미션이 없어요.");
  }

  if (!trimmedAnswer || trimmedAnswer.length > 300) {
    throw new Error("답변은 1자 이상 300자 이하로 남겨주세요.");
  }

  const rewardStarPiece = mission.rewardStarPiece;
  demoHomeState.wallet.starPiece += rewardStarPiece;
  demoHomeState.character.states.affection = {
    value: Math.min(100, demoHomeState.character.states.affection.value + 5),
    label: "가까움",
    grade: "GOOD",
  };
  demoHomeState.currentMission = null;
  lastClosedMissionStackOrder = mission.stackOrder;

  return {
    missionId,
    status: "COMPLETED",
    answer: {
      text: trimmedAnswer,
      answeredAt: new Date().toISOString(),
    },
    reward: {
      starPiece: rewardStarPiece,
      affection: 5,
    },
    wallet: {
      starPiece: demoHomeState.wallet.starPiece,
    },
    characterMessage: "무! 오늘의 작은 행동을 별조각으로 남겨둘게요.",
  };
}
