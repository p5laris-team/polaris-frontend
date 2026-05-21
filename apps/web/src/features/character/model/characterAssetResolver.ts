import {
  characterAssets,
  characterStateAssets,
  skinCharacterAssets,
  type CharacterKey,
  type CharacterMood,
  type CharacterSkinKey,
  type CharacterVisualState,
} from "@/shared/assets/polarisAssets";
import { type CharacterStates } from "@/entities/character/types";

type EquippedSkinInput = {
  itemId?: number | null;
  name?: string | null;
} | null;

type ResolveCharacterImageInput = {
  character: CharacterKey;
  mood?: CharacterMood;
  states?: CharacterStates | null;
  equippedSkin?: EquippedSkinInput;
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
  fallbackUrl,
}: ResolveCharacterImageInput) {
  const visualState = resolveCharacterVisualState(states, mood);
  const skinKey = resolveCharacterSkinKey(equippedSkin);
  const skinImageUrl = skinKey ? skinCharacterAssets[skinKey]?.[character]?.[visualState] : null;
  const baseImageUrl =
    characterStateAssets[character]?.[visualState] ?? characterAssets[character]?.[mood];

  if (skinImageUrl) {
    return skinImageUrl;
  }

  if (equippedSkin && fallbackUrl) {
    return fallbackUrl;
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

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}
