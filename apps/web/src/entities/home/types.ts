/**
 * 홈 화면에서 여러 도메인의 요약 데이터를 한 번에 받기 위한 타입입니다.
 * 홈은 사용자, 지갑, 캐릭터, 현재 미션, 알림을 모으는 대시보드 성격이라 shared entity로 둡니다.
 */
import {
  type CharacterGrowth,
  type CharacterStates,
  type CharacterTypeCode,
} from "@/entities/character/types";
import { type CurrentMissionResponse } from "@/entities/mission/types";

/** 홈 카드에서 필요한 현재 미션의 최소 필드만 추린 요약 타입입니다. */
export type HomeCurrentMissionSummary = Pick<
  CurrentMissionResponse,
  "id" | "title" | "characterMessage" | "rewardStarPiece" | "status"
>;

/** 홈 API 응답입니다. 캐릭터가 아직 없을 수 있으므로 character/currentMission은 null을 허용합니다. */
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
    growth?: CharacterGrowth | null;
  } | null;
  currentMission: HomeCurrentMissionSummary | null;
  notifications: {
    unreadCount: number;
  };
};
