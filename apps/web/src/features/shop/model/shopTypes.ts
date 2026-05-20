import { type CursorPage } from "@/shared/api";

export type ShopItemType = "SKIN";

export type ShopItem = {
  id: number;
  name: string;
  itemType: ShopItemType;
  price: number;
  imageUrl: string;
  owned: boolean;
};

export type ShopItemsRequest = {
  itemType: ShopItemType;
  active: boolean;
  cursor?: string | null;
  size: number;
};

export type ShopItemsResponse = CursorPage<ShopItem>;

export type PurchaseShopItemRequest = {
  itemId: number;
  quantity: number;
};

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
