/**
 * 상점/보관함 아이템 이미지를 고르는 resolver입니다.
 * 서버 이미지가 비어 있거나 이름만 내려오는 fixture에서도 화면이 깨지지 않도록 로컬 asset을 먼저 매핑합니다.
 */
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

// 스킨 이름이나 imageUrl에 들어간 키워드로 로컬 썸네일을 찾기 위한 규칙입니다.
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

/** 아이템 종류와 효과 타입을 기준으로 최종 아이템 이미지 URL을 반환합니다. */
export function resolveItemImageUrl(item: ItemAssetInput) {
  if (item.itemType === "CONSUMABLE") {
    const effectType = resolveConsumableEffectType(item);

    return effectType ? consumableItemAssets[effectType] : item.imageUrl ?? "";
  }

  const skinKey = resolveSkinThumbnailKey(item);

  return skinKey ? skinThumbnailAssets[skinKey] : item.imageUrl ?? "";
}

/** 소모품 effectType이 없을 때 이름과 이미지 URL을 보고 FOOD/REST/PLAY를 추론합니다. */
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

/** 스킨 이름/URL 키워드를 로컬 썸네일 key로 변환합니다. */
function resolveSkinThumbnailKey(item: ItemAssetInput): SkinThumbnailKey | null {
  const haystack = normalizeSearchText(`${item.name} ${item.imageUrl ?? ""}`);
  const rule = skinThumbnailRules.find(({ keywords }) =>
    keywords.some((keyword) => haystack.includes(normalizeSearchText(keyword))),
  );

  return rule?.key ?? null;
}

/** 키워드 비교를 위해 소문자화와 공백 제거를 적용합니다. */
function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}
