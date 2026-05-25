import {
  type CharacterAssetUrls,
  type CharacterStates,
  type CharacterTypeCode,
} from "@/entities/character/types";

export type CareActionType = "FEED" | "SLEEP" | "PLAY";

export type ActiveCharacterResponse = {
  id: number;
  name: string;
  characterTypeCode: CharacterTypeCode;
  currentAssetUrl: string;
  assetUrls?: CharacterAssetUrls;
  states: CharacterStates;
  equippedSkin?: {
    itemId: number;
    name: string;
  } | null;
};

export type CharacterStatusResponse = {
  characterId: number;
  states: CharacterStates;
};

export type CharacterCareRequest = {
  actionType: CareActionType;
  itemId?: number;
};

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
  characterMessage: string;
};
