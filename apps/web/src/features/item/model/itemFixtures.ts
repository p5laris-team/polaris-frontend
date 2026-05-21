import { brandAssets } from "@/shared/assets/polarisAssets";

export type DemoSkinCatalogItem = {
  id: number;
  name: string;
  itemType: "SKIN";
  characterTypeId: number | null;
  price: number;
  imageUrl: string;
};

export type DemoUserSkinItem = {
  userItemId: number;
  itemId: number;
  name: string;
  itemType: "SKIN";
  characterTypeId: number | null;
  effectType: null;
  quantity: number;
  imageUrl: string;
};

export type DemoCareEffectType = "FOOD" | "REST" | "PLAY";

export type DemoConsumableItem = {
  id: number;
  name: string;
  description: string;
  itemType: "CONSUMABLE";
  effectType: DemoCareEffectType;
  price: number;
  imageUrl: string;
};

export type DemoUserConsumableItem = {
  userItemId: number;
  itemId: number;
  name: string;
  itemType: "CONSUMABLE";
  characterTypeId: null;
  effectType: DemoCareEffectType;
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
    characterTypeId: 2,
    price: 60,
    imageUrl: brandAssets.stardustPattern,
  },
  {
    id: 4,
    name: "푸른 새벽 스킨",
    itemType: "SKIN",
    characterTypeId: 2,
    price: 90,
    imageUrl: brandAssets.stardustPattern,
  },
  {
    id: 5,
    name: "따뜻한 라떼 스킨",
    itemType: "SKIN",
    characterTypeId: 2,
    price: 120,
    imageUrl: brandAssets.stardustPattern,
  },
  {
    id: 6,
    name: "노바 은하 망토",
    itemType: "SKIN",
    characterTypeId: 1,
    price: 80,
    imageUrl: brandAssets.stardustPattern,
  },
  {
    id: 7,
    name: "노바 별빛 리본",
    itemType: "SKIN",
    characterTypeId: 1,
    price: 110,
    imageUrl: brandAssets.stardustPattern,
  },
  {
    id: 8,
    name: "쪼리 달빛 후드",
    itemType: "SKIN",
    characterTypeId: 3,
    price: 80,
    imageUrl: brandAssets.stardustPattern,
  },
  {
    id: 9,
    name: "쪼리 구름 파자마",
    itemType: "SKIN",
    characterTypeId: 3,
    price: 110,
    imageUrl: brandAssets.stardustPattern,
  },
];

const demoConsumableCatalog: DemoConsumableItem[] = [
  {
    id: 21,
    name: "별사탕밥",
    description: "포만감을 채워주는 달콤한 돌봄 먹이",
    itemType: "CONSUMABLE",
    effectType: "FOOD",
    price: 10,
    imageUrl: brandAssets.stardustPattern,
  },
  {
    id: 22,
    name: "구름 베개",
    description: "기운을 회복시켜 주는 폭신한 휴식 아이템",
    itemType: "CONSUMABLE",
    effectType: "REST",
    price: 15,
    imageUrl: brandAssets.stardustPattern,
  },
  {
    id: 23,
    name: "별 장난감",
    description: "애정을 올려주는 반짝이는 놀이 아이템",
    itemType: "CONSUMABLE",
    effectType: "PLAY",
    price: 15,
    imageUrl: brandAssets.stardustPattern,
  },
];

let ownedSkinItemIds = new Set<number>();
let equippedSkinItemId: number | null = null;
let ownedConsumableQuantities = new Map<number, number>([
  [21, 2],
  [22, 1],
  [23, 3],
]);

export function demoGetSkinCatalogItems() {
  return demoSkinCatalog.map((item) => ({ ...item }));
}

export function demoGetConsumableCatalogItems() {
  return demoConsumableCatalog.map((item) => ({ ...item }));
}

export function demoFindSkinCatalogItem(itemId: number) {
  const item = demoSkinCatalog.find((skin) => skin.id === itemId);

  return item ? { ...item } : null;
}

export function demoFindConsumableCatalogItem(itemId: number) {
  const item = demoConsumableCatalog.find((consumable) => consumable.id === itemId);

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
      characterTypeId: item.characterTypeId,
      effectType: null,
      quantity: 1,
      imageUrl: item.imageUrl,
    }));
}

export function demoGetUserConsumableItems(): DemoUserConsumableItem[] {
  // SCR-012 돌봄 fixture는 백엔드 user_items.quantity처럼 보유 수량을 유지한다.
  return demoConsumableCatalog.map((item) => ({
    userItemId: 600 + item.id,
    itemId: item.id,
    name: item.name,
    itemType: "CONSUMABLE",
    characterTypeId: null,
    effectType: item.effectType,
    quantity: ownedConsumableQuantities.get(item.id) ?? 0,
    imageUrl: item.imageUrl,
  }));
}

export function demoIsConsumableOwned(itemId: number) {
  return (ownedConsumableQuantities.get(itemId) ?? 0) > 0;
}

export function demoFindUserConsumableItem(itemId: number) {
  const item = demoGetUserConsumableItems().find((consumable) => consumable.itemId === itemId);

  return item ? { ...item } : null;
}

export function demoAddConsumableItem(itemId: number, quantity: number) {
  const item = demoFindConsumableCatalogItem(itemId);

  if (!item) {
    throw new Error("상점에서 해당 소모품을 찾지 못했어요.");
  }

  const currentQuantity = ownedConsumableQuantities.get(itemId) ?? 0;
  ownedConsumableQuantities = new Map(ownedConsumableQuantities);
  ownedConsumableQuantities.set(itemId, currentQuantity + quantity);

  return {
    item,
    quantity: currentQuantity + quantity,
  };
}

export function demoUseConsumableItem(itemId: number) {
  const item = demoFindConsumableCatalogItem(itemId);

  if (!item) {
    throw new Error("돌봄에 사용할 아이템을 찾지 못했어요.");
  }

  const currentQuantity = ownedConsumableQuantities.get(itemId) ?? 0;

  if (currentQuantity <= 0) {
    throw new Error("아이템 수량이 부족해요.");
  }

  const nextQuantity = currentQuantity - 1;
  ownedConsumableQuantities = new Map(ownedConsumableQuantities);
  ownedConsumableQuantities.set(itemId, nextQuantity);

  return {
    itemId,
    quantityUsed: 1,
    remainingQuantity: nextQuantity,
  };
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
