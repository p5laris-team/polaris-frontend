import {
  demoCareForCharacter,
  getDemoActiveCharacter,
} from "@/features/home/model/homeFixture";
import {
  demoFindUserConsumableItem,
  demoGetEquippedSkin,
  demoUseConsumableItem,
  type DemoCareEffectType,
} from "@/features/item/model/itemFixtures";
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

const careActionEffectType: Record<CareActionType, DemoCareEffectType> = {
  FEED: "FOOD",
  SLEEP: "REST",
  PLAY: "PLAY",
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

  if (!body.itemId) {
    throw new Error("돌봄에 사용할 아이템을 선택해 주세요.");
  }

  const consumable = demoFindUserConsumableItem(body.itemId);
  const expectedEffectType = careActionEffectType[body.actionType];

  if (!consumable || consumable.effectType !== expectedEffectType) {
    throw new Error("이 돌봄에는 맞는 아이템만 사용할 수 있어요.");
  }

  // 백엔드 CharacterService는 care log 생성 후 item UseItem gRPC로 수량 1개를 차감한다.
  demoUseConsumableItem(body.itemId);
  const result = demoCareForCharacter(body.actionType);

  return {
    careLogId: Date.now(),
    characterId,
    actionType: body.actionType,
    consumed: { itemId: body.itemId, quantity: 1 },
    beforeStates: result.beforeStates,
    afterStates: result.afterStates,
    characterMessage: actionMessage[body.actionType],
  };
}
