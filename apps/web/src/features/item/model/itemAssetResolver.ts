import {
  consumableItemAssets,
  skinThumbnailAssets,
  type ConsumableItemAssetKey,
  type SkinThumbnailKey,
} from "@/shared/assets/polarisAssets";

type ItemAssetInput = {
  name: string;
  itemType: "SKIN" | "CONSUMABLE";
  effectType?: string | null;
  imageUrl?: string | null;
};

const skinThumbnailRules: Array<{
  key: SkinThumbnailKey;
  keywords: string[];
}> = [
  {
    key: "dawn",
    keywords: ["새벽", "푸른", "dawn"],
  },
  {
    key: "nightSky",
    keywords: ["밤하늘", "은하", "오로라", "달빛", "구름파자마", "milky", "night"],
  },
  {
    key: "starlight",
    keywords: ["말랑", "별빛", "라떼", "starlight", "soft-star"],
  },
];

export function resolveItemImageUrl(item: ItemAssetInput) {
  if (item.itemType === "CONSUMABLE") {
    const effectType = resolveConsumableEffectType(item);

    return effectType ? consumableItemAssets[effectType] : item.imageUrl ?? "";
  }

  const skinKey = resolveSkinThumbnailKey(item);

  return skinKey ? skinThumbnailAssets[skinKey] : item.imageUrl ?? "";
}

function resolveConsumableEffectType(
  item: ItemAssetInput,
): ConsumableItemAssetKey | null {
  const explicitEffectType = item.effectType?.toUpperCase();

  if (
    explicitEffectType === "FOOD" ||
    explicitEffectType === "REST" ||
    explicitEffectType === "PLAY"
  ) {
    return explicitEffectType;
  }

  const haystack = normalizeSearchText(`${item.name} ${item.imageUrl ?? ""}`);

  if (haystack.includes("밥") || haystack.includes("먹") || haystack.includes("candy")) {
    return "FOOD";
  }

  if (haystack.includes("베개") || haystack.includes("잠") || haystack.includes("cloud")) {
    return "REST";
  }

  if (haystack.includes("장난감") || haystack.includes("toy")) {
    return "PLAY";
  }

  return null;
}

function resolveSkinThumbnailKey(item: ItemAssetInput): SkinThumbnailKey | null {
  const haystack = normalizeSearchText(`${item.name} ${item.imageUrl ?? ""}`);
  const rule = skinThumbnailRules.find(({ keywords }) =>
    keywords.some((keyword) => haystack.includes(normalizeSearchText(keyword))),
  );

  return rule?.key ?? null;
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}
