import { demoApplyItemPurchase } from "@/features/home/model/homeFixture";
import {
  demoFindSkinCatalogItem,
  demoGetSkinCatalogItems,
  demoIsSkinOwned,
  demoOwnSkinItem,
} from "@/features/item/model/itemFixtures";

import {
  type PurchaseShopItemRequest,
  type PurchaseShopItemResponse,
  type ShopItemsRequest,
  type ShopItemsResponse,
} from "./shopTypes";

let nextPurchaseId = 700;
let nextTransactionId = 901;

export function demoGetShopItems({
  itemType,
  size,
}: ShopItemsRequest): ShopItemsResponse {
  const items = itemType === "SKIN" ? demoGetSkinCatalogItems() : [];

  return {
    // SCR-013 fixture는 API의 owned 필드를 구매 직후 바로 갱신해 상점 카드 상태를 확인하게 한다.
    items: items.slice(0, size).map((item) => ({
      ...item,
      owned: demoIsSkinOwned(item.id),
    })),
    pageInfo: {
      nextCursor: null,
      hasNext: false,
      size,
    },
  };
}

export function demoPurchaseShopItem({
  itemId,
  quantity,
}: PurchaseShopItemRequest): PurchaseShopItemResponse {
  const item = demoFindSkinCatalogItem(itemId);

  if (!item) {
    throw new Error("상점에서 해당 스킨을 찾지 못했어요.");
  }

  if (quantity !== 1) {
    throw new Error("스킨은 한 번에 하나만 구매할 수 있어요.");
  }

  if (demoIsSkinOwned(itemId)) {
    throw new Error("이미 보유 중인 스킨이에요.");
  }

  const wallet = demoApplyItemPurchase({ price: item.price });
  demoOwnSkinItem(itemId);

  return {
    purchaseId: nextPurchaseId++,
    itemId,
    name: item.name,
    quantity,
    price: item.price,
    wallet,
    transactionId: nextTransactionId++,
  };
}
