/**
 * 미션 도메인에서 여러 화면이 공유하는 백엔드 응답 타입입니다.
 * 상태값은 화면 이동과 버튼 활성화 조건을 결정하므로 여기서 의미를 주석으로 정리합니다.
 */

export type MissionStatus =
  // 아직 사용자에게 제안되기 전, 시스템이 생성만 해 둔 미션입니다.
  | "GENERATED"
  // 홈에 현재 제안되어 사용자가 수행하거나 거절할 수 있는 미션입니다.
  | "OFFERED"
  // 사용자가 완료 버튼을 눌러 인증 질문에 답하는 중인 미션입니다.
  | "ANSWERING"
  // 답변 제출과 보상 지급까지 끝난 미션입니다.
  | "COMPLETED"
  // 사용자가 다른 미션을 보겠다고 거절한 미션입니다.
  | "REJECTED"
  // 날짜 또는 정책상 더 이상 진행할 수 없는 만료 미션입니다.
  | "EXPIRED";

/** 미션 난이도 enum입니다. 화면에서는 쉬움/보통/도전 라벨로 바꿔 표시합니다. */
export type MissionDifficulty = "EASY" | "NORMAL" | "CHALLENGE";

export type MissionFeedbackType = "SATISFACTION" | "REJECTION";

export type MissionFeedbackReaction = "LIKE" | "DISLIKE";

export type MissionRewardStatus = "PAID" | "PENDING" | "PROCESSING" | "FAILED";

/** 홈과 인증 화면에서 쓰는 현재 미션 상세 응답입니다. */
export type CurrentMissionResponse = {
  id: number;
  missionDate: string;
  stackOrder: number;
  title: string;
  description: string;
  characterMessage: string;
  category: string;
  difficulty: MissionDifficulty;
  rewardStarPiece: number;
  status: MissionStatus;
};

/** 오늘 미션 기록 목록에서 쓰는 미션 요약 항목입니다. */
export type TodayMissionItem = {
  id: number;
  stackOrder: number;
  title: string;
  category: string;
  difficulty: MissionDifficulty;
  rewardStarPiece: number;
  status: MissionStatus;
  characterMessage: string;
  createdAt: string;
  completedAt: string | null;
  rejectedAt: string | null;
  completionQuestion: string | null;
  answerPreview: string | null;
  hasAnswer: boolean;
};

/** 오늘 하루의 미션 스택과 진행 수치를 함께 내려주는 응답입니다. */
export type TodayMissionsResponse = {
  missionDate: string;
  maxDailyOffers: number;
  offeredCount: number;
  completedCount: number;
  rejectedCount: number;
  remainingOfferCount: number;
  maxDailyRewardCount: number;
  completedRewardCount: number;
  remainingRewardCount: number;
  maxDailyRejectCount: number;
  remainingRejectCount: number;
  currentMissionId: number | null;
  missions: TodayMissionItem[];
};

/** 완료 인증을 시작했을 때 백엔드가 내려주는 단일 질문 응답입니다. */
export type MissionCompletionQuestionResponse = {
  missionId: number;
  status: "ANSWERING";
  question: {
    id: number;
    text: string;
    inputType: "TEXT";
    minLength: number;
    maxLength: number;
  };
};

/** 미션 거절 후 캐릭터 반응 메시지와 거절 시각을 담는 응답입니다. */
export type MissionRejectionResponse = {
  missionId: number;
  status: "REJECTED";
  rejectedAt: string;
  characterMessage: string;
};

/** 다음 미션 요청에 필요한 최소 정보입니다. 마지막 미션 id를 보내 중복 제안을 줄입니다. */
export type RequestNextMissionRequest = {
  characterId: number;
  lastMissionId?: number;
};

/** 완료 인증 답변 제출 payload입니다. */
export type SubmitMissionCompletionAnswerRequest = {
  answer: string;
};

/** 답변 제출 후 보상, 지갑 잔액, 캐릭터 반응을 한 번에 보여주기 위한 결과 응답입니다. */
export type MissionCompletionResultResponse = {
  missionId: number;
  status: "COMPLETED";
  rewardStatus?: MissionRewardStatus;
  answer: {
    text: string;
    answeredAt: string;
  };
  reward: {
    starPiece: number;
    affection: number;
  };
  wallet: {
    starPiece: number;
  };
  characterMessage: string;
};

export type MissionDetailResponse = {
  id: number;
  missionDate: string;
  stackOrder: number;
  title: string;
  description: string;
  characterMessage: string;
  category: string;
  difficulty: MissionDifficulty;
  rewardStarPiece: number;
  status: MissionStatus;
  createdAt: string;
  completedAt: string | null;
  rejectedAt: string | null;
  question: {
    id: number;
    text: string;
    inputType: "TEXT";
    minLength: number;
    maxLength: number;
  } | null;
  answer: {
    text: string;
    answeredAt: string;
  } | null;
  completionCharacterResponse: string | null;
  hasAnswer: boolean;
  satisfactionFeedback: {
    reaction: MissionFeedbackReaction;
    updatedAt: string;
  } | null;
};

export type UpsertMissionFeedbackRequest = {
  feedbackType: MissionFeedbackType;
  reaction?: MissionFeedbackReaction;
  reasonCode?: string;
  reasonText?: string;
};

export type MissionFeedbackResponse = {
  missionId: number;
  feedbackType: MissionFeedbackType;
  reaction: MissionFeedbackReaction | null;
  reasonCode: string | null;
  reasonText: string | null;
  updatedAt: string;
};
