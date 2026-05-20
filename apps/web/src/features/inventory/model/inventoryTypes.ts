import { type CursorPage } from "@/shared/api";

export type InventoryItemType = "SKIN";

export type UserInventoryItem = {
  userItemId: number;
  itemId: number;
  name: string;
  itemType: InventoryItemType;
  effectType: null;
  quantity: number;
  imageUrl: string;
};

export type UserItemsRequest = {
  itemType: InventoryItemType;
  cursor?: string | null;
  size: number;
};

export type UserItemsResponse = CursorPage<UserInventoryItem>;

export type EquippedSkin = {
  itemId: number;
  name: string;
} | null;

export type UpdateEquippedSkinRequest = {
  itemId: number | null;
};

export type UpdateEquippedSkinResponse = {
  characterId: number;
  equippedSkin: EquippedSkin;
  updatedAt: string;
};
