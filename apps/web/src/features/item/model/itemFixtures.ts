import { brandAssets } from "@/shared/assets/polarisAssets";

export type DemoSkinCatalogItem = {
  id: number;
  name: string;
  itemType: "SKIN";
  price: number;
  imageUrl: string;
};

export type DemoUserSkinItem = {
  userItemId: number;
  itemId: number;
  name: string;
  itemType: "SKIN";
  effectType: null;
  quantity: number;
  imageUrl: string;
};

export type DemoEquippedSkin = {
  itemId: number;
  name: string;
} | null;

const demoSkinCatalog: DemoSkinCatalogItem[] = [
  {
    id: 3,
    name: "말랑 별빛 스킨",
    itemType: "SKIN",
    price: 60,
    imageUrl: brandAssets.stardustPattern,
  },
  {
    id: 4,
    name: "푸른 새벽 스킨",
    itemType: "SKIN",
    price: 90,
    imageUrl: brandAssets.stardustPattern,
  },
  {
    id: 5,
    name: "따뜻한 라떼 스킨",
    itemType: "SKIN",
    price: 120,
    imageUrl: brandAssets.stardustPattern,
  },
];

let ownedSkinItemIds = new Set<number>();
let equippedSkinItemId: number | null = null;

export function demoGetSkinCatalogItems() {
  return demoSkinCatalog.map((item) => ({ ...item }));
}

export function demoFindSkinCatalogItem(itemId: number) {
  const item = demoSkinCatalog.find((skin) => skin.id === itemId);

  return item ? { ...item } : null;
}

export function demoIsSkinOwned(itemId: number) {
  return ownedSkinItemIds.has(itemId);
}

export function demoOwnSkinItem(itemId: number) {
  const item = demoFindSkinCatalogItem(itemId);

  if (!item) {
    throw new Error("상점에서 해당 스킨을 찾지 못했어요.");
  }

  ownedSkinItemIds = new Set([...ownedSkinItemIds, itemId]);

  return item;
}

export function demoGetUserSkinItems(): DemoUserSkinItem[] {
  // SCR-013/014 fixture는 같은 보유 스킨 Set을 공유해 구매 직후 인벤토리에서 바로 보이게 한다.
  return demoSkinCatalog
    .filter((item) => ownedSkinItemIds.has(item.id))
    .map((item) => ({
      userItemId: 400 + item.id,
      itemId: item.id,
      name: item.name,
      itemType: "SKIN",
      effectType: null,
      quantity: 1,
      imageUrl: item.imageUrl,
    }));
}

export function demoGetEquippedSkin(): DemoEquippedSkin {
  if (equippedSkinItemId === null) {
    return null;
  }

  const item = demoFindSkinCatalogItem(equippedSkinItemId);

  return item
    ? {
        itemId: item.id,
        name: item.name,
      }
    : null;
}

export function demoSetEquippedSkin(itemId: number | null): DemoEquippedSkin {
  if (itemId === null) {
    equippedSkinItemId = null;
    return null;
  }

  const item = demoFindSkinCatalogItem(itemId);

  if (!item || !ownedSkinItemIds.has(itemId)) {
    throw new Error("보유한 스킨만 장착할 수 있어요.");
  }

  equippedSkinItemId = itemId;

  return {
    itemId: item.id,
    name: item.name,
  };
}
