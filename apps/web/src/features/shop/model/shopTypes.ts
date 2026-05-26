/**
 * 상점 API와 화면이 공유하는 타입입니다.
 * 상품 목록, 구매 요청, 구매 결과의 지갑 스냅샷까지 이 파일에서 정의합니다.
 */
import { type CursorPage } from "@/shared/api";

/** 상점 상품 종류입니다. SKIN은 1회 구매 성격이고 CONSUMABLE은 수량 구매가 가능합니다. */
export type ShopItemType = "SKIN" | "CONSUMABLE";

/** 소모품이 회복시키는 돌봄 상태 종류입니다. */
export type ShopItemEffectType = "FOOD" | "REST" | "PLAY";

/** 상점에 노출되는 상품 한 개입니다. owned는 스킨 중복 구매 방지 UI에 사용합니다. */
export type ShopItem = {
  id: number;
  name: string;
  description?: string;
  itemType: ShopItemType;
  characterTypeId?: number | null;
  effectType?: ShopItemEffectType | null;
  price: number;
  imageUrl: string;
  owned: boolean;
};

/** 상점 상품 목록 요청입니다. cursor/size로 대용량 상품 목록 확장에 대비합니다. */
export type ShopItemsRequest = {
  itemType: ShopItemType;
  active: boolean;
  cursor?: string | null;
  size: number;
};

/** 상점 상품 목록 응답입니다. */
export type ShopItemsResponse = CursorPage<ShopItem>;

/** 상품 구매 요청입니다. 소모품은 quantity가 1보다 클 수 있습니다. */
export type PurchaseShopItemRequest = {
  itemId: number;
  quantity: number;
};

/** 구매 결과입니다. transactionId와 wallet 스냅샷으로 지갑 정합성을 확인할 수 있습니다. */
export type PurchaseShopItemResponse = {
  purchaseId: number;
  itemId: number;
  name: string;
  quantity: number;
  price: number;
  wallet: {
    starPiece: number;
  };
  transactionId: number;
};
