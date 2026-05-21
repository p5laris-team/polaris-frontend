import { demoApplyItemPurchase } from "@/features/home/model/homeFixture";
import {
  demoAddConsumableItem,
  demoFindConsumableCatalogItem,
  demoFindSkinCatalogItem,
  demoGetConsumableCatalogItems,
  demoGetSkinCatalogItems,
  demoIsConsumableOwned,
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
  const items =
    itemType === "SKIN" ? demoGetSkinCatalogItems() : demoGetConsumableCatalogItems();

  return {
    // SCR-013 fixture는 백엔드의 itemType 필터처럼 스킨/소모품 상점 목록을 따로 내려준다.
    items: items.slice(0, size).map((item) => ({
      ...item,
      owned:
        item.itemType === "SKIN" ? demoIsSkinOwned(item.id) : demoIsConsumableOwned(item.id),
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

  if (item) {
    if (quantity !== 1) {
      throw new Error("스킨은 한 번에 하나만 구매할 수 있어요.");
    }

    if (demoIsSkinOwned(itemId)) {
      throw new Error("이미 보유 중인 스킨이에요.");
    }

    const wallet = demoApplyItemPurchase({
      price: item.price,
      itemId: item.id,
      itemName: `${item.name} 구매`,
    });
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

  const consumable = demoFindConsumableCatalogItem(itemId);

  if (!consumable) {
    throw new Error("상점에서 해당 아이템을 찾지 못했어요.");
  }

  if (quantity < 1) {
    throw new Error("구매 수량을 1개 이상 선택해 주세요.");
  }

  const totalPrice = consumable.price * quantity;
  const wallet = demoApplyItemPurchase({
    price: totalPrice,
    itemId: consumable.id,
    itemName: `${consumable.name} ${quantity}개 구매`,
  });
  demoAddConsumableItem(itemId, quantity);

  return {
    purchaseId: nextPurchaseId++,
    itemId,
    name: consumable.name,
    quantity,
    price: totalPrice,
    wallet,
    transactionId: nextTransactionId++,
  };
}
