export type MissionStatus =
  | "GENERATED"
  | "OFFERED"
  | "ANSWERING"
  | "COMPLETED"
  | "REJECTED"
  | "EXPIRED";

export type MissionDifficulty = "EASY" | "NORMAL" | "HARD";

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

export type MissionRejectionResponse = {
  missionId: number;
  status: "REJECTED";
  rejectedAt: string;
  characterMessage: string;
};

export type RequestNextMissionRequest = {
  characterId: number;
  lastMissionId?: number;
};

export type SubmitMissionCompletionAnswerRequest = {
  answer: string;
};

export type MissionCompletionResultResponse = {
  missionId: number;
  status: "COMPLETED";
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
