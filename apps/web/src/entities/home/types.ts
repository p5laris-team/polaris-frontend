import { type CharacterStates, type CharacterTypeCode } from "@/entities/character/types";
import { type CurrentMissionResponse } from "@/entities/mission/types";

export type HomeCurrentMissionSummary = Pick<
  CurrentMissionResponse,
  "id" | "title" | "characterMessage" | "rewardStarPiece" | "status"
>;

export type HomeResponse = {
  user: {
    id: number;
    nickname: string;
  };
  wallet: {
    starPiece: number;
  };
  character: {
    id: number;
    name: string;
    characterTypeCode: CharacterTypeCode | string;
    currentAssetUrl: string | null;
    states: CharacterStates | null;
  } | null;
  currentMission: HomeCurrentMissionSummary | null;
  notifications: {
    unreadCount: number;
  };
};
