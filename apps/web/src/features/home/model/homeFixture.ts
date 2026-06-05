import { type HomeResponse } from "@/entities/home/types";
import {
  type CharacterGrowth,
  type CharacterStates,
  type CharacterStatusValue,
  type CharacterTypeCode,
} from "@/entities/character/types";
import {
  type CurrentMissionResponse,
  type MissionDetailResponse,
  type MissionFeedbackResponse,
  type MissionCompletionQuestionResponse,
  type MissionCompletionResultResponse,
  type MissionFeedbackReaction,
  type MissionRejectionResponse,
  type RequestNextMissionRequest,
  type TodayMissionItem,
  type TodayMissionsResponse,
  type UpsertMissionFeedbackRequest,
} from "@/entities/mission/types";
import { demoRecordWalletTransaction } from "@/features/wallet/model/walletLedger";

const MAX_DAILY_MISSION_OFFERS = 20;
const MAX_DAILY_MISSION_REWARDS = 10;
const MAX_DAILY_MISSION_REJECTIONS = 10;
const todayMissionDate = getTodayDateKey();

const missionTemplates: CurrentMissionResponse[] = [
  {
    id: 104,
    missionDate: todayMissionDate,
    stackOrder: 4,
    title: "창문 열고 숨 고르기",
    description: "지금 자리에서 창문을 열고 공기를 한 번 바꿔보세요.",
    characterMessage: "무... 오늘의 작은 별을 찾은 것 같아요.",
    category: "BASIC_ROUTINE",
    difficulty: "EASY",
    rewardStarPiece: 10,
    status: "OFFERED",
  },
  {
    id: 105,
    missionDate: todayMissionDate,
    stackOrder: 5,
    title: "책상 위 물건 하나 치우기",
    description: "눈에 보이는 물건 하나만 제자리로 옮겨보세요.",
    characterMessage: "무... 공간이 조금 숨을 쉬게 될 것 같아요.",
    category: "SPACE_RESET",
    difficulty: "EASY",
    rewardStarPiece: 10,
    status: "OFFERED",
  },
  {
    id: 106,
    missionDate: todayMissionDate,
    stackOrder: 6,
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

const initialCharacterGrowth: CharacterGrowth = {
  level: 1,
  exp: 0,
  currentLevelExp: 0,
  nextLevelExp: 200,
  expToNextLevel: 200,
  progressPercent: 0,
  growthStage: "BABY",
  growthStageLabel: "처음 만난 별친구",
  maxLevel: false,
};

type DemoCareActionType = "FEED" | "SLEEP" | "PLAY";
type DemoHomeResponse = HomeResponse & {
  character: NonNullable<HomeResponse["character"]> & {
    characterTypeCode: CharacterTypeCode;
    currentAssetUrl: string;
    states: CharacterStates;
  };
  currentMission: CurrentMissionResponse | null;
};

const initialHomeResponse: DemoHomeResponse = {
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
    growth: initialCharacterGrowth,
  },
  currentMission: missionTemplates[0],
  notifications: {
    unreadCount: 2,
  },
};

const initialTodayMissions: TodayMissionItem[] = [
  {
    id: 101,
    stackOrder: 1,
    title: "물 한 컵 마시기",
    category: "BASIC_ROUTINE",
    difficulty: "EASY",
    rewardStarPiece: 10,
    status: "COMPLETED",
    characterMessage: "잘했어. 작은 시작도 별조각이 됐어.",
    createdAt: toTodayIsoTime("09:10"),
    completedAt: toTodayIsoTime("09:15"),
    rejectedAt: null,
    completionQuestion: "물을 마시고 나니 몸이 어떻게 느껴졌나요?",
    answerPreview: "잠깐 멈춰서 물을 마시니까 머리가 조금 맑아졌어요.",
    hasAnswer: true,
  },
  {
    id: 102,
    stackOrder: 2,
    title: "햇빛 한 번 보기",
    category: "OUTDOOR",
    difficulty: "EASY",
    rewardStarPiece: 10,
    status: "COMPLETED",
    characterMessage: "무... 빛을 봤으니 오늘도 조금 반짝였어요.",
    createdAt: toTodayIsoTime("10:05"),
    completedAt: toTodayIsoTime("10:12"),
    rejectedAt: null,
    completionQuestion: "햇빛을 보면서 어떤 장면이 기억에 남았나요?",
    answerPreview: "창가에 서서 빛을 보니까 오늘이 조금 덜 흐릿했어요.",
    hasAnswer: true,
  },
  {
    id: 103,
    stackOrder: 3,
    title: "책장 한 칸 정리하기",
    category: "SPACE_RESET",
    difficulty: "NORMAL",
    rewardStarPiece: 12,
    status: "REJECTED",
    characterMessage: "괜찮아요. 다른 별을 찾아볼게요.",
    createdAt: toTodayIsoTime("10:40"),
    completedAt: null,
    rejectedAt: toTodayIsoTime("10:42"),
    completionQuestion: null,
    answerPreview: null,
    hasAnswer: false,
  },
  toTodayMissionItem(initialHomeResponse.currentMission!, toTodayIsoTime("11:30")),
];

let demoHomeState: DemoHomeResponse = clone(initialHomeResponse);
let demoTodayMissions = clone(initialTodayMissions);
const demoMissionSatisfactionFeedbacks = new Map<
  number,
  { reaction: MissionFeedbackReaction; updatedAt: string }
>();
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

export function demoGetTodayMissions(): TodayMissionsResponse {
  const missions = [...demoTodayMissions].sort((a, b) => a.stackOrder - b.stackOrder);
  const completedCount = missions.filter((mission) => mission.status === "COMPLETED").length;
  const rejectedCount = missions.filter((mission) => mission.status === "REJECTED").length;

  return {
    missionDate: todayMissionDate,
    maxDailyOffers: MAX_DAILY_MISSION_OFFERS,
    offeredCount: missions.length,
    completedCount,
    rejectedCount,
    remainingOfferCount: Math.max(0, MAX_DAILY_MISSION_OFFERS - missions.length),
    maxDailyRewardCount: MAX_DAILY_MISSION_REWARDS,
    completedRewardCount: Math.min(completedCount, MAX_DAILY_MISSION_REWARDS),
    remainingRewardCount: Math.max(0, MAX_DAILY_MISSION_REWARDS - completedCount),
    maxDailyRejectCount: MAX_DAILY_MISSION_REJECTIONS,
    remainingRejectCount: Math.max(0, MAX_DAILY_MISSION_REJECTIONS - rejectedCount),
    currentMissionId: demoHomeState.currentMission?.id ?? null,
    missions: clone(missions),
  };
}

export function demoGetMissionHistory(date: string): TodayMissionsResponse {
  return {
    ...demoGetTodayMissions(),
    missionDate: date,
  };
}

export function demoGetMissionDetail(missionId: number): MissionDetailResponse {
  const mission = demoTodayMissions.find((item) => item.id === missionId);
  const currentMission = demoHomeState.currentMission?.id === missionId ? demoHomeState.currentMission : null;

  if (!mission && !currentMission) {
    throw new Error("미션 상세를 찾지 못했어요.");
  }

  const base = currentMission ?? {
    id: mission!.id,
    missionDate: todayMissionDate,
    stackOrder: mission!.stackOrder,
    title: mission!.title,
    description: mission!.characterMessage,
    characterMessage: mission!.characterMessage,
    category: mission!.category,
    difficulty: mission!.difficulty,
    rewardStarPiece: mission!.rewardStarPiece,
    status: mission!.status,
  };
  const item = mission ?? toTodayMissionItem(base);

  return {
    ...base,
    createdAt: item.createdAt,
    completedAt: item.completedAt,
    rejectedAt: item.rejectedAt,
    question: item.completionQuestion
      ? {
          id: 501,
          text: item.completionQuestion,
          inputType: "TEXT",
          minLength: 1,
          maxLength: 300,
        }
      : null,
    answer: item.answerPreview
      ? {
          text: item.answerPreview,
          answeredAt: item.completedAt ?? item.createdAt,
        }
      : null,
    completionCharacterResponse:
      item.status === "COMPLETED" ? "무! 작은 실천이 오늘의 별조각으로 남았어요." : null,
    satisfactionFeedback: demoMissionSatisfactionFeedbacks.get(missionId) ?? null,
    hasAnswer: item.hasAnswer,
  };
}

export function demoUpsertMissionFeedback(
  missionId: number,
  body: UpsertMissionFeedbackRequest,
): MissionFeedbackResponse {
  const updatedAt = new Date().toISOString();

  if (body.feedbackType === "SATISFACTION" && body.reaction) {
    demoMissionSatisfactionFeedbacks.set(missionId, {
      reaction: body.reaction,
      updatedAt,
    });
  }

  return {
    missionId,
    feedbackType: body.feedbackType,
    reaction: body.reaction ?? null,
    reasonCode: body.reasonCode ?? null,
    reasonText: body.reasonText ?? null,
    updatedAt,
  };
}

export function demoSetUnreadNotificationCount(unreadCount: number) {
  // 알림 fixture에서 읽음 상태가 바뀌면 홈의 알림 요약 숫자도 같은 기준으로 맞춘다.
  demoHomeState.notifications.unreadCount = Math.max(0, unreadCount);
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
  const beforeStates = toNumericStates(demoHomeState.character.states);
  const nextStates = applyCareToStates(beforeStates, actionType);

  // SCR-012 돌봄은 백엔드처럼 소모품 수량 차감과 상태 변화만 처리하고 별조각은 직접 차감하지 않는다.
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
  demoRecordWalletTransaction({
    amount: rewardStarPiece,
    balanceAfter: demoHomeState.wallet.starPiece,
    reason: "ATTENDANCE_REWARD",
    description: "오늘 출석 보상",
    sourceType: "ATTENDANCE",
    sourceId: null,
  });

  return {
    starPiece: demoHomeState.wallet.starPiece,
    affection: nextAffection,
  };
}

export function demoApplyShareReward(rewardStarPiece: number) {
  // SCR-016 공유 보상 fixture는 홈 지갑과 함께 움직여 공유 직후 별조각 숫자가 어긋나지 않게 한다.
  demoHomeState.wallet.starPiece += rewardStarPiece;

  if (rewardStarPiece > 0) {
    demoRecordWalletTransaction({
      amount: rewardStarPiece,
      balanceAfter: demoHomeState.wallet.starPiece,
      reason: "SHARE_REWARD",
      description: "공유 카드 보상",
      sourceType: "SHARE",
      sourceId: null,
    });
  }

  return {
    starPiece: demoHomeState.wallet.starPiece,
  };
}

export function demoApplyItemPurchase({
  price,
  itemId,
  itemName = "스킨 구매",
}: {
  price: number;
  itemId?: number;
  itemName?: string;
}) {
  if (demoHomeState.wallet.starPiece < price) {
    throw new Error("별조각이 부족해요. 미션을 완료해서 별조각을 모아봐요!");
  }

  // SCR-013 fixture 구매는 홈 지갑을 함께 차감해 상점과 홈의 별조각 숫자가 어긋나지 않게 한다.
  demoHomeState.wallet.starPiece -= price;
  demoRecordWalletTransaction({
    amount: -price,
    balanceAfter: demoHomeState.wallet.starPiece,
    reason: "ITEM_PURCHASE",
    description: itemName,
    sourceType: "ITEM",
    sourceId: itemId ?? null,
  });

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
  patchTodayMission(missionId, { status: "ANSWERING" });

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
  const rejectedAt = new Date().toISOString();
  patchTodayMission(missionId, {
    status: "REJECTED",
    rejectedAt,
  });

  return {
    missionId,
    status: "REJECTED",
    rejectedAt,
    characterMessage: "괜찮아요. 다른 별을 찾아볼게요.",
  };
}

export function demoRequestNextMission(body: RequestNextMissionRequest): CurrentMissionResponse {
  if (demoTodayMissions.length >= MAX_DAILY_MISSION_OFFERS) {
    throw new Error("오늘 제안 가능한 미션을 모두 확인했어요. 내일 다시 찾아올게요.");
  }

  const lastOrder =
    missionTemplates.find((mission) => mission.id === body.lastMissionId)?.stackOrder ??
    demoHomeState.currentMission?.stackOrder ??
    lastClosedMissionStackOrder;
  const nextOrder = Math.min(lastOrder + 1, MAX_DAILY_MISSION_OFFERS);
  const template = missionTemplates[(nextOrder - 3) % missionTemplates.length];
  const nextMission = {
    ...template,
    id: 100 + nextOrder,
    stackOrder: nextOrder,
    status: "OFFERED",
  } satisfies CurrentMissionResponse;

  demoHomeState.currentMission = nextMission;
  lastClosedMissionStackOrder = nextMission.stackOrder;
  upsertTodayMission(toTodayMissionItem(nextMission));

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

  const answeredAt = new Date().toISOString();
  const rewardStarPiece = mission.rewardStarPiece;
  demoHomeState.wallet.starPiece += rewardStarPiece;
  demoRecordWalletTransaction({
    amount: rewardStarPiece,
    balanceAfter: demoHomeState.wallet.starPiece,
    reason: "MISSION_REWARD",
    description: `${mission.title} 완료`,
    sourceType: "MISSION",
    sourceId: mission.id,
  });
  demoHomeState.character.states.affection = {
    value: Math.min(100, demoHomeState.character.states.affection.value + 5),
    label: "가까움",
    grade: "GOOD",
  };
  const beforeGrowth = clone(demoHomeState.character.growth ?? initialCharacterGrowth);
  const afterGrowth = applyDemoCharacterExp(beforeGrowth, 80);
  const levelUp = afterGrowth.level > beforeGrowth.level;
  demoHomeState.character.growth = afterGrowth;
  demoHomeState.currentMission = null;
  lastClosedMissionStackOrder = mission.stackOrder;
  patchTodayMission(missionId, {
    status: "COMPLETED",
    completedAt: answeredAt,
    completionQuestion: "방금 미션을 해내면서 어떤 점이 제일 기억에 남았나요?",
    answerPreview: trimmedAnswer,
    hasAnswer: true,
  });

  return {
    missionId,
    status: "COMPLETED",
    rewardStatus: "PAID",
    characterExp: {
      expAmount: 80,
      expGained: 80,
      levelUp,
      status: "APPLIED",
      beforeGrowth,
      afterGrowth,
    },
    answer: {
      text: trimmedAnswer,
      answeredAt,
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

function applyDemoCharacterExp(growth: CharacterGrowth, expGained: number): CharacterGrowth {
  let nextExp = growth.exp + expGained;
  let nextLevel = growth.level;
  let currentLevelExp = growth.currentLevelExp;
  let nextLevelExp = growth.nextLevelExp;

  while (nextExp >= nextLevelExp && nextLevel < 3) {
    nextLevel += 1;
    currentLevelExp = nextLevelExp;
    nextLevelExp += nextLevel === 2 ? 300 : 500;
  }

  const maxLevel = nextLevel >= 3;
  if (maxLevel) {
    nextExp = Math.min(nextExp, nextLevelExp);
  }

  const required = Math.max(1, nextLevelExp - currentLevelExp);
  const current = Math.max(0, Math.min(required, nextExp - currentLevelExp));

  return {
    ...growth,
    level: nextLevel,
    exp: nextExp,
    currentLevelExp,
    nextLevelExp,
    expToNextLevel: maxLevel ? 0 : Math.max(0, nextLevelExp - nextExp),
    progressPercent: maxLevel ? 100 : Math.round((current / required) * 100),
    growthStage: nextLevel >= 3 ? "MATURE" : nextLevel >= 2 ? "GROWING" : "BABY",
    growthStageLabel: nextLevel >= 3 ? "완전히 자란 별친구" : nextLevel >= 2 ? "조금 자란 별친구" : "처음 만난 별친구",
    maxLevel,
  };
}

function toTodayMissionItem(
  mission: CurrentMissionResponse,
  createdAt = new Date().toISOString(),
): TodayMissionItem {
  return {
    id: mission.id,
    stackOrder: mission.stackOrder,
    title: mission.title,
    category: mission.category,
    difficulty: mission.difficulty,
    rewardStarPiece: mission.rewardStarPiece,
    status: mission.status,
    characterMessage: mission.characterMessage,
    createdAt,
    completedAt: null,
    rejectedAt: null,
    completionQuestion: null,
    answerPreview: null,
    hasAnswer: false,
  };
}

function upsertTodayMission(mission: TodayMissionItem) {
  const existingIndex = demoTodayMissions.findIndex((item) => item.id === mission.id);

  if (existingIndex >= 0) {
    demoTodayMissions[existingIndex] = mission;
    return;
  }

  demoTodayMissions = [...demoTodayMissions, mission];
}

function patchTodayMission(missionId: number, updates: Partial<TodayMissionItem>) {
  demoTodayMissions = demoTodayMissions.map((mission) =>
    mission.id === missionId ? { ...mission, ...updates } : mission,
  );
}

function getTodayDateKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

function toTodayIsoTime(time: string) {
  return `${todayMissionDate}T${time}:00+09:00`;
}
