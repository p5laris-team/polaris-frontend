import {
  characterAssets,
  characterStateAssets,
  skinCharacterAssets,
  type CharacterKey,
  type CharacterMood,
  type CharacterSkinKey,
  type CharacterVisualState,
} from "@/shared/assets/polarisAssets";
import {
  type CharacterAssetKey,
  type CharacterAssetUrls,
  type CharacterStates,
} from "@/entities/character/types";

type EquippedSkinInput = {
  itemId?: number | null;
  name?: string | null;
} | null;

type ResolveCharacterImageInput = {
  character: CharacterKey;
  mood?: CharacterMood;
  states?: CharacterStates | null;
  equippedSkin?: EquippedSkinInput;
  assetUrls?: CharacterAssetUrls | null;
  fallbackUrl?: string | null;
};

const skinKeywordRules: Array<{
  key: CharacterSkinKey;
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

export function resolveCharacterImageUrl({
  character,
  mood = "idle",
  states,
  equippedSkin,
  assetUrls,
  fallbackUrl,
}: ResolveCharacterImageInput) {
  const visualState = resolveCharacterVisualState(states, mood);
  const remoteImageUrl = resolveRemoteAssetUrl(assetUrls, visualState);
  const skinKey = resolveCharacterSkinKey(equippedSkin);
  const skinImageUrl = skinKey ? skinCharacterAssets[skinKey]?.[character]?.[visualState] : null;
  const baseImageUrl =
    characterStateAssets[character]?.[visualState] ?? characterAssets[character]?.[mood];

  // 운영에서는 백엔드가 내려주는 assetUrls가 캐릭터 이미지의 기준이고, 로컬 에셋은 누락/지연 시 안전망으로만 사용한다.
  if (remoteImageUrl) {
    return remoteImageUrl;
  }

  if (skinImageUrl) {
    return skinImageUrl;
  }

  return baseImageUrl ?? fallbackUrl ?? characterAssets.nova.idle;
}

export function resolveCharacterSkinKey(
  equippedSkin: EquippedSkinInput | undefined,
): CharacterSkinKey | null {
  if (!equippedSkin) {
    return null;
  }

  const name = normalizeSearchText(equippedSkin.name ?? "");
  const matchedRule = skinKeywordRules.find(({ keywords }) =>
    keywords.some((keyword) => name.includes(normalizeSearchText(keyword))),
  );

  if (matchedRule) {
    return matchedRule.key;
  }

  return null;
}

function resolveCharacterVisualState(
  states: CharacterStates | null | undefined,
  mood: CharacterMood,
): CharacterVisualState {
  if (states?.hunger?.grade === "BAD") {
    return "hungry";
  }

  if (states?.energy?.grade === "BAD") {
    return "lowEnergy";
  }

  if (states?.affection?.grade === "BAD") {
    return "lonely";
  }

  return mood;
}

function resolveRemoteAssetUrl(
  assetUrls: CharacterAssetUrls | null | undefined,
  visualState: CharacterVisualState,
) {
  if (!assetUrls) {
    return null;
  }

  const remoteUrl = assetUrls[visualState] ?? assetUrls[toSnakeAssetKey(visualState)];

  return remoteUrl && remoteUrl.trim() ? remoteUrl : null;
}

function toSnakeAssetKey(visualState: CharacterVisualState): CharacterAssetKey | "low_energy" {
  return visualState === "lowEnergy" ? "low_energy" : visualState;
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}
