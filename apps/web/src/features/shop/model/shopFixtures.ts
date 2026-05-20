import { demoApplyItemPurchase } from "@/features/home/model/homeFixture";
import { brandAssets } from "@/shared/assets/polarisAssets";

import {
  type PurchaseShopItemRequest,
  type PurchaseShopItemResponse,
  type ShopItem,
  type ShopItemsRequest,
  type ShopItemsResponse,
} from "./shopTypes";

const demoSkinItems: ShopItem[] = [
  {
    id: 3,
    name: "말랑 별빛 스킨",
    itemType: "SKIN",
    price: 60,
    imageUrl: brandAssets.stardustPattern,
    owned: false,
  },
  {
    id: 4,
    name: "푸른 새벽 스킨",
    itemType: "SKIN",
    price: 90,
    imageUrl: brandAssets.stardustPattern,
    owned: false,
  },
  {
    id: 5,
    name: "따뜻한 라떼 스킨",
    itemType: "SKIN",
    price: 120,
    imageUrl: brandAssets.stardustPattern,
    owned: false,
  },
];

let ownedSkinItemIds = new Set<number>();
let nextPurchaseId = 700;
let nextTransactionId = 901;

export function demoGetShopItems({
  itemType,
  size,
}: ShopItemsRequest): ShopItemsResponse {
  const items = itemType === "SKIN" ? demoSkinItems : [];

  return {
    // SCR-013 fixture는 API의 owned 필드를 구매 직후 바로 갱신해 상점 카드 상태를 확인하게 한다.
    items: items.slice(0, size).map((item) => ({
      ...item,
      owned: ownedSkinItemIds.has(item.id),
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
  const item = demoSkinItems.find((skin) => skin.id === itemId);

  if (!item) {
    throw new Error("상점에서 해당 스킨을 찾지 못했어요.");
  }

  if (quantity !== 1) {
    throw new Error("스킨은 한 번에 하나만 구매할 수 있어요.");
  }

  if (ownedSkinItemIds.has(itemId)) {
    throw new Error("이미 보유 중인 스킨이에요.");
  }

  const wallet = demoApplyItemPurchase({ price: item.price });
  ownedSkinItemIds = new Set([...ownedSkinItemIds, itemId]);

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
