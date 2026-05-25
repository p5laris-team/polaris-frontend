/**
 * 보관함 API와 화면이 공유하는 타입입니다.
 * 상점에서 산 스킨/소모품이 사용자 소유 아이템으로 바뀐 뒤 이 구조로 내려옵니다.
 */
import { type CursorPage } from "@/shared/api";

/** 사용자 보관함에 들어올 수 있는 아이템 종류입니다. SKIN은 장착 가능, CONSUMABLE은 돌봄에서 소모됩니다. */
export type InventoryItemType = "SKIN" | "CONSUMABLE";

/** 돌봄 소모품이 회복시키는 상태 종류입니다. */
export type InventoryItemEffectType = "FOOD" | "REST" | "PLAY";

/** 사용자가 보유한 아이템 한 개의 수량, 이미지, 적용 캐릭터 정보를 담습니다. */
export type UserInventoryItem = {
  userItemId: number;
  itemId: number;
  name: string;
  itemType: InventoryItemType;
  characterTypeId: number | null;
  effectType: InventoryItemEffectType | null;
  quantity: number;
  imageUrl: string;
};

/** 보관함 목록 조회 요청입니다. cursor 기반 페이지네이션 확장을 고려한 형태입니다. */
export type UserItemsRequest = {
  itemType: InventoryItemType;
  cursor?: string | null;
  size: number;
};

/** 보관함 목록 응답입니다. */
export type UserItemsResponse = CursorPage<UserInventoryItem>;

/** 현재 장착된 스킨입니다. null이면 기본 외형을 사용한다는 뜻입니다. */
export type EquippedSkin = {
  itemId: number;
  name: string;
} | null;

/** 스킨 장착 변경 요청입니다. itemId=null이면 기본 외형으로 해제합니다. */
export type UpdateEquippedSkinRequest = {
  itemId: number | null;
};

/** 장착 변경 이후 최신 장착 상태를 돌려주는 응답입니다. */
export type UpdateEquippedSkinResponse = {
  characterId: number;
  equippedSkin: EquippedSkin;
  updatedAt: string;
};
