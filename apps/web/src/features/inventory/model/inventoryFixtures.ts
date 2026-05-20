import { getDemoActiveCharacter } from "@/features/home/model/homeFixture";
import {
  demoGetUserSkinItems,
  demoSetEquippedSkin,
} from "@/features/item/model/itemFixtures";

import {
  type UpdateEquippedSkinRequest,
  type UpdateEquippedSkinResponse,
  type UserItemsRequest,
  type UserItemsResponse,
} from "./inventoryTypes";

export function demoGetUserItems({ itemType, size }: UserItemsRequest): UserItemsResponse {
  const items = itemType === "SKIN" ? demoGetUserSkinItems() : [];

  return {
    items: items.slice(0, size),
    pageInfo: {
      nextCursor: null,
      hasNext: false,
      size,
    },
  };
}

export function demoUpdateEquippedSkin(
  characterId: number,
  body: UpdateEquippedSkinRequest,
): UpdateEquippedSkinResponse {
  const character = getDemoActiveCharacter();

  if (character.id !== characterId) {
    throw new Error("스킨을 바꿀 별친구를 찾지 못했어요.");
  }

  // SCR-014 fixture 장착 해제는 API 명세처럼 itemId null을 기본 외형으로 저장한다.
  const equippedSkin = demoSetEquippedSkin(body.itemId);

  return {
    characterId,
    equippedSkin,
    updatedAt: new Date().toISOString(),
  };
}
