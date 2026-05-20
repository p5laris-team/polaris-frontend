import { type CharacterStates, type CharacterTypeCode } from "@/entities/character/types";
import { type CurrentMissionResponse } from "@/entities/mission/types";

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
    characterTypeCode: CharacterTypeCode;
    currentAssetUrl: string;
    states: CharacterStates;
  };
  currentMission: CurrentMissionResponse | null;
  notifications: {
    unreadCount: number;
  };
};
