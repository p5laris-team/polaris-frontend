import {
  demoCareForCharacter,
  getDemoActiveCharacter,
  getDemoWalletStarPiece,
} from "@/features/home/model/homeFixture";
import { demoGetEquippedSkin } from "@/features/item/model/itemFixtures";
import {
  type ActiveCharacterResponse,
  type CareActionType,
  type CharacterCareRequest,
  type CharacterCareResultResponse,
  type CharacterStatusResponse,
} from "@/features/character/model/characterCareTypes";

const actionMessage: Record<CareActionType, string> = {
  FEED: "냠냠... 포만감이 조금 차올랐어요.",
  SLEEP: "쿨... 기운을 되찾는 중이에요.",
  PLAY: "무! 같이 놀아줘서 마음이 반짝해요.",
};

export function demoGetActiveCharacter(): ActiveCharacterResponse {
  const character = getDemoActiveCharacter();

  return {
    ...character,
    equippedSkin: demoGetEquippedSkin(),
  };
}

export function demoGetCharacterStatus(characterId: number): CharacterStatusResponse {
  const character = getDemoActiveCharacter();

  if (character.id !== characterId) {
    throw new Error("현재 돌볼 수 있는 별친구를 찾지 못했어요.");
  }

  return {
    characterId,
    states: character.states,
  };
}

export function demoCreateCareLog(
  characterId: number,
  body: CharacterCareRequest,
): CharacterCareResultResponse {
  const character = getDemoActiveCharacter();

  if (character.id !== characterId) {
    throw new Error("현재 돌볼 수 있는 별친구를 찾지 못했어요.");
  }

  const result = demoCareForCharacter(body.actionType);

  return {
    careLogId: Date.now(),
    characterId,
    actionType: body.actionType,
    consumed: body.itemId ? { itemId: body.itemId, quantity: 1 } : null,
    beforeStates: result.beforeStates,
    afterStates: result.afterStates,
    wallet: {
      starPiece: getDemoWalletStarPiece(),
    },
    characterMessage: actionMessage[body.actionType],
  };
}
