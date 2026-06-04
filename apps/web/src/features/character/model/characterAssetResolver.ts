/**
 * 캐릭터 이미지 선택 규칙을 모아 둔 resolver입니다.
 * 백엔드 CDN URL, 로컬 기본 이미지, 장착 스킨, 상태 등급이 섞여 있어 화면에서 직접 계산하지 않도록 분리했습니다.
 */
import {
  characterAssets,
  characterGrowthStateAssets,
  characterStateAssets,
  skinCharacterAssets,
  type CharacterGrowthAssetLevel,
  type CharacterKey,
  type CharacterMood,
  type CharacterSkinKey,
  type CharacterVisualState,
} from "@/shared/assets/polarisAssets";
import {
  type CharacterAssetKey,
  type CharacterAssetUrls,
  type CharacterGrowth,
  type CharacterStates,
} from "@/entities/character/types";

type EquippedSkinInput = {
  itemId?: number | null;
  name?: string | null;
} | null;

/** 캐릭터 이미지 선택에 필요한 모든 후보 정보를 담는 입력 타입입니다. */
type ResolveCharacterImageInput = {
  character: CharacterKey;
  mood?: CharacterMood;
  states?: CharacterStates | null;
  growth?: CharacterGrowth | null;
  equippedSkin?: EquippedSkinInput;
  assetUrls?: CharacterAssetUrls | null;
  fallbackUrl?: string | null;
};

// 백엔드 item name만으로도 프론트 스킨 asset을 찾을 수 있게 하는 키워드 매핑입니다.
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

/** 상태 등급과 장착 스킨을 고려해서 화면에 보여줄 최종 캐릭터 이미지 URL을 고릅니다. */
export function resolveCharacterImageUrl({
  character,
  mood = "idle",
  states,
  growth,
  equippedSkin,
  assetUrls,
  fallbackUrl,
}: ResolveCharacterImageInput) {
  const visualState = resolveCharacterVisualState(states, mood);
  const remoteImageUrl = resolveRemoteAssetUrl(assetUrls, visualState);
  const growthLevel = resolveCharacterGrowthAssetLevel(growth);
  const skinKey = resolveCharacterSkinKey(equippedSkin);
  const canUseSkinAsset = !growthLevel || growthLevel === "lv3";
  const skinImageUrl =
    canUseSkinAsset && skinKey ? skinCharacterAssets[skinKey]?.[character]?.[visualState] : null;
  const growthImageUrl = growthLevel
    ? characterGrowthStateAssets[character]?.[growthLevel]?.[visualState]
    : null;
  const baseImageUrl =
    growthImageUrl ?? characterStateAssets[character]?.[visualState] ?? characterAssets[character]?.[mood];
  const localImageUrl = skinImageUrl ?? baseImageUrl;

  // 현재 화면 렌더링은 프론트에 포함된 검수 에셋을 우선 사용하고, 백엔드 URL은 로컬 매핑이 비었을 때만 안전망으로 둔다.
  return localImageUrl ?? remoteImageUrl ?? fallbackUrl ?? characterAssets.nova.idle;
}

/** 장착된 스킨 이름을 프론트에서 관리하는 skin key로 변환합니다. */
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

/** BAD 상태가 있으면 mood보다 상태 이상 이미지를 우선합니다. */
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

/** 성장 단계 응답을 프론트 성장 에셋 레벨로 변환합니다. 응답이 없으면 기존 성체/스킨 정책을 유지합니다. */
function resolveCharacterGrowthAssetLevel(
  growth: CharacterGrowth | null | undefined,
): CharacterGrowthAssetLevel | null {
  if (!growth) {
    return null;
  }

  const stage = `${growth.growthStage ?? ""}`.toUpperCase();

  if (stage === "BABY" || growth.level <= 1) {
    return "lv1";
  }

  if (stage === "GROWING" || growth.level === 2) {
    return "lv2";
  }

  return "lv3";
}

/** 백엔드 assetUrls에서 현재 visualState와 맞는 CDN URL을 찾습니다. */
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

/** 백엔드가 snake_case로 내려주는 low_energy key도 함께 읽기 위한 보정 함수입니다. */
function toSnakeAssetKey(visualState: CharacterVisualState): CharacterAssetKey | "low_energy" {
  return visualState === "lowEnergy" ? "low_energy" : visualState;
}

/** 한글/영문 키워드 비교가 흔들리지 않도록 소문자와 공백 제거를 적용합니다. */
function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}
