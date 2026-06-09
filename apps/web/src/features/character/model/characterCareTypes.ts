/**
 * 캐릭터 돌봄 API 타입입니다.
 * 활성 캐릭터 조회, 상태 조회, 돌봄 액션 생성 결과를 한 파일에서 관리합니다.
 */
import {
  type CharacterAssetUrls,
  type CharacterGrowth,
  type CharacterStates,
  type CharacterTypeCode,
} from "@/entities/character/types";

/** 돌봄 액션 enum입니다. FEED는 포만감, SLEEP은 기운, PLAY는 애정 회복 흐름과 연결됩니다. */
export type CareActionType = "FEED" | "SLEEP" | "PLAY";

/** 현재 사용자의 활성 별친구 정보입니다. 홈/돌봄/보관함에서 공통으로 사용합니다. */
export type ActiveCharacterResponse = {
  id: number;
  name: string;
  characterTypeCode: CharacterTypeCode;
  currentAssetUrl: string;
  assetUrls?: CharacterAssetUrls;
  states: CharacterStates;
  growth?: CharacterGrowth | null;
  equippedSkin?: {
    itemId: number;
    name: string;
  } | null;
};

/** 별친구 상태 게이지만 따로 조회하는 응답입니다. */
export type CharacterStatusResponse = {
  characterId: number;
  states: CharacterStates;
  growth?: CharacterGrowth | null;
};

/** 돌봄 로그 생성 요청입니다. itemId는 소모품을 사용했을 때 함께 보냅니다. */
export type CharacterCareRequest = {
  actionType: CareActionType;
  itemId?: number;
};

/** 돌봄 처리 결과입니다. before/after 상태와 소모 아이템으로 정합성을 확인할 수 있습니다. */
export type CharacterCareResultResponse = {
  careLogId: number;
  characterId: number;
  actionType: CareActionType;
  consumed: {
    itemId: number;
    quantity: number;
  } | null;
  beforeStates: Record<keyof CharacterStates, number>;
  afterStates: Record<keyof CharacterStates, number>;
  beforeGrowth?: CharacterGrowth | null;
  afterGrowth?: CharacterGrowth | null;
  expGained?: number;
  levelUp?: boolean;
  characterMessage: string;
};
