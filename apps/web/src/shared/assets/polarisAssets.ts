type CharacterKey = "nova" | "jjori" | "mumu";
type CharacterMood = "idle" | "happy" | "sleepy";
type CharacterVisualState = CharacterMood | "hungry" | "lowEnergy" | "lonely";
type AttendanceAssetKey = "stamp" | "streak7";
type CharacterGrowthAssetLevel = "lv1" | "lv2" | "lv3";
type GrowthStageKey = "baby" | "growing" | "mature";
type CategoryKey =
  | "basicRoutine"
  | "spaceReset"
  | "miniExercise"
  | "moodCare"
  | "focusHelp"
  | "socialLight"
  // 예전 fixture/화면 호환용 key입니다. 신규 미션은 위 6개 key로 매핑합니다.
  | "morning"
  | "fitness"
  | "reading"
  | "mind";
type SkinThumbnailKey = "starlight" | "dawn" | "nightSky";
type CharacterSkinKey = SkinThumbnailKey;
type ConsumableItemAssetKey = "FOOD" | "REST" | "PLAY";
type CurrencyAssetKey = "starPiece";
type EmptyStateAssetKey =
  | "mission"
  | "inventory"
  | "notification"
  | "share"
  | "careItem"
  | "growth"
  | "memory"
  | "missionHistory"
  | "shop"
  | "talk"
  | "wallet"
  | "weather"
  | "errorAi"
  | "errorNetwork"
  | "errorRewardPending"
  | "errorServer"
  | "errorStarry";
type EffectAssetKey =
  | "starParticle"
  | "sparkleBurst"
  | "rewardStamp"
  | "expOrb"
  | "expTrail"
  | "growthSparkle"
  | "levelUpBurst";
type RewardEffectAssetKey =
  | "paidStar"
  | "pendingClock"
  | "failedSoft"
  | "onceADay"
  | "retrySpark";
type TalkAssetKey =
  | "avatarMumu"
  | "avatarNova"
  | "avatarJjori"
  | "bubbleSparkle"
  | "loadingStar"
  | "panelBg"
  | "sendSparkle"
  | "typingDots";
type MemoryAssetKey =
  | "fragmentCommon"
  | "fragmentLore"
  | "fragmentEasterEgg"
  | "cardBg"
  | "lockedStar"
  | "unlockedGlow"
  | "unlockEffect";
type WeatherAssetKey =
  | "sunny"
  | "cloudy"
  | "rain"
  | "snow"
  | "hot"
  | "cold"
  | "night"
  | "midnight";
type NotificationAssetKey =
  | "attendance"
  | "mission"
  | "reward"
  | "share"
  | "state"
  | "system";
type ShareCardBackgroundKey = "default" | "night" | "warm";
type ShareCardDecorationKey = "stardust" | "friendsFrame";
type ShareCardStampKey = "complete";

/**
 * 화면에서 사용하는 모든 이미지 경로를 한곳에 모아 둔 asset registry입니다.
 * 컴포넌트가 파일 경로를 직접 만들지 않고 여기의 key를 사용하면 에셋 교체 범위가 줄어듭니다.
 */
// Vite가 번들에 포함할 수 있도록 frontend 루트 assets/를 참조한다.
const assetUrl = (fileName: string) =>
  new URL(`../../../../../assets/${fileName}`, import.meta.url).href;

const characterCoreAsset = (character: CharacterKey, mood: CharacterMood) =>
  assetUrl(`characters/${character}/core/character-${character}-${mood}.png`);

const characterStatusAsset = (
  character: CharacterKey,
  state: Exclude<CharacterVisualState, CharacterMood>,
) =>
  assetUrl(
    `characters/${character}/status/character-${character}-${toCharacterAssetFileState(state)}.png`,
  );

const characterGrowthAsset = (
  character: CharacterKey,
  level: CharacterGrowthAssetLevel,
  state: CharacterVisualState,
) => {
  if (level === "lv3") {
    return characterStateAssets[character][state];
  }

  return assetUrl(
    `characters/${character}/growth/${level}/character-${character}-${level}-${toCharacterAssetFileState(state)}.png`,
  );
};

const skinAssetPath: Record<CharacterSkinKey, string> = {
  starlight: "starlight",
  dawn: "dawn",
  nightSky: "night-sky",
};

const skinCharacterAsset = (
  skin: CharacterSkinKey,
  character: CharacterKey,
  state: CharacterVisualState,
) => {
  const folder = isCharacterMood(state) ? "core" : "status";
  const skinPath = skinAssetPath[skin];

  return assetUrl(
    `skins/${skinPath}/equipped/${character}/${folder}/skin-${skinPath}-${character}-${toCharacterAssetFileState(state)}.png`,
  );
};

export const characterStateAssets: Record<CharacterKey, Record<CharacterVisualState, string>> = {
  nova: {
    idle: characterCoreAsset("nova", "idle"),
    happy: characterCoreAsset("nova", "happy"),
    sleepy: characterCoreAsset("nova", "sleepy"),
    hungry: characterStatusAsset("nova", "hungry"),
    lowEnergy: characterStatusAsset("nova", "lowEnergy"),
    lonely: characterStatusAsset("nova", "lonely"),
  },
  jjori: {
    idle: characterCoreAsset("jjori", "idle"),
    happy: characterCoreAsset("jjori", "happy"),
    sleepy: characterCoreAsset("jjori", "sleepy"),
    hungry: characterStatusAsset("jjori", "hungry"),
    lowEnergy: characterStatusAsset("jjori", "lowEnergy"),
    lonely: characterStatusAsset("jjori", "lonely"),
  },
  mumu: {
    idle: characterCoreAsset("mumu", "idle"),
    happy: characterCoreAsset("mumu", "happy"),
    sleepy: characterCoreAsset("mumu", "sleepy"),
    hungry: characterStatusAsset("mumu", "hungry"),
    lowEnergy: characterStatusAsset("mumu", "lowEnergy"),
    lonely: characterStatusAsset("mumu", "lonely"),
  },
};

export const characterAssets: Record<CharacterKey, Record<CharacterMood, string>> = {
  nova: {
    idle: characterStateAssets.nova.idle,
    happy: characterStateAssets.nova.happy,
    sleepy: characterStateAssets.nova.sleepy,
  },
  jjori: {
    idle: characterStateAssets.jjori.idle,
    happy: characterStateAssets.jjori.happy,
    sleepy: characterStateAssets.jjori.sleepy,
  },
  mumu: {
    idle: characterStateAssets.mumu.idle,
    happy: characterStateAssets.mumu.happy,
    sleepy: characterStateAssets.mumu.sleepy,
  },
};

export const characterGrowthStateAssets: Record<
  CharacterKey,
  Record<CharacterGrowthAssetLevel, Record<CharacterVisualState, string>>
> = {
  nova: {
    lv1: buildCharacterGrowthStateAssets("nova", "lv1"),
    lv2: buildCharacterGrowthStateAssets("nova", "lv2"),
    lv3: buildCharacterGrowthStateAssets("nova", "lv3"),
  },
  jjori: {
    lv1: buildCharacterGrowthStateAssets("jjori", "lv1"),
    lv2: buildCharacterGrowthStateAssets("jjori", "lv2"),
    lv3: buildCharacterGrowthStateAssets("jjori", "lv3"),
  },
  mumu: {
    lv1: buildCharacterGrowthStateAssets("mumu", "lv1"),
    lv2: buildCharacterGrowthStateAssets("mumu", "lv2"),
    lv3: buildCharacterGrowthStateAssets("mumu", "lv3"),
  },
};

export const skinCharacterAssets: Record<
  CharacterSkinKey,
  Record<CharacterKey, Record<CharacterVisualState, string>>
> = {
  starlight: {
    nova: {
      idle: skinCharacterAsset("starlight", "nova", "idle"),
      happy: skinCharacterAsset("starlight", "nova", "happy"),
      sleepy: skinCharacterAsset("starlight", "nova", "sleepy"),
      hungry: skinCharacterAsset("starlight", "nova", "hungry"),
      lowEnergy: skinCharacterAsset("starlight", "nova", "lowEnergy"),
      lonely: skinCharacterAsset("starlight", "nova", "lonely"),
    },
    jjori: {
      idle: skinCharacterAsset("starlight", "jjori", "idle"),
      happy: skinCharacterAsset("starlight", "jjori", "happy"),
      sleepy: skinCharacterAsset("starlight", "jjori", "sleepy"),
      hungry: skinCharacterAsset("starlight", "jjori", "hungry"),
      lowEnergy: skinCharacterAsset("starlight", "jjori", "lowEnergy"),
      lonely: skinCharacterAsset("starlight", "jjori", "lonely"),
    },
    mumu: {
      idle: skinCharacterAsset("starlight", "mumu", "idle"),
      happy: skinCharacterAsset("starlight", "mumu", "happy"),
      sleepy: skinCharacterAsset("starlight", "mumu", "sleepy"),
      hungry: skinCharacterAsset("starlight", "mumu", "hungry"),
      lowEnergy: skinCharacterAsset("starlight", "mumu", "lowEnergy"),
      lonely: skinCharacterAsset("starlight", "mumu", "lonely"),
    },
  },
  dawn: {
    nova: {
      idle: skinCharacterAsset("dawn", "nova", "idle"),
      happy: skinCharacterAsset("dawn", "nova", "happy"),
      sleepy: skinCharacterAsset("dawn", "nova", "sleepy"),
      hungry: skinCharacterAsset("dawn", "nova", "hungry"),
      lowEnergy: skinCharacterAsset("dawn", "nova", "lowEnergy"),
      lonely: skinCharacterAsset("dawn", "nova", "lonely"),
    },
    jjori: {
      idle: skinCharacterAsset("dawn", "jjori", "idle"),
      happy: skinCharacterAsset("dawn", "jjori", "happy"),
      sleepy: skinCharacterAsset("dawn", "jjori", "sleepy"),
      hungry: skinCharacterAsset("dawn", "jjori", "hungry"),
      lowEnergy: skinCharacterAsset("dawn", "jjori", "lowEnergy"),
      lonely: skinCharacterAsset("dawn", "jjori", "lonely"),
    },
    mumu: {
      idle: skinCharacterAsset("dawn", "mumu", "idle"),
      happy: skinCharacterAsset("dawn", "mumu", "happy"),
      sleepy: skinCharacterAsset("dawn", "mumu", "sleepy"),
      hungry: skinCharacterAsset("dawn", "mumu", "hungry"),
      lowEnergy: skinCharacterAsset("dawn", "mumu", "lowEnergy"),
      lonely: skinCharacterAsset("dawn", "mumu", "lonely"),
    },
  },
  nightSky: {
    nova: {
      idle: skinCharacterAsset("nightSky", "nova", "idle"),
      happy: skinCharacterAsset("nightSky", "nova", "happy"),
      sleepy: skinCharacterAsset("nightSky", "nova", "sleepy"),
      hungry: skinCharacterAsset("nightSky", "nova", "hungry"),
      lowEnergy: skinCharacterAsset("nightSky", "nova", "lowEnergy"),
      lonely: skinCharacterAsset("nightSky", "nova", "lonely"),
    },
    jjori: {
      idle: skinCharacterAsset("nightSky", "jjori", "idle"),
      happy: skinCharacterAsset("nightSky", "jjori", "happy"),
      sleepy: skinCharacterAsset("nightSky", "jjori", "sleepy"),
      hungry: skinCharacterAsset("nightSky", "jjori", "hungry"),
      lowEnergy: skinCharacterAsset("nightSky", "jjori", "lowEnergy"),
      lonely: skinCharacterAsset("nightSky", "jjori", "lonely"),
    },
    mumu: {
      idle: skinCharacterAsset("nightSky", "mumu", "idle"),
      happy: skinCharacterAsset("nightSky", "mumu", "happy"),
      sleepy: skinCharacterAsset("nightSky", "mumu", "sleepy"),
      hungry: skinCharacterAsset("nightSky", "mumu", "hungry"),
      lowEnergy: skinCharacterAsset("nightSky", "mumu", "lowEnergy"),
      lonely: skinCharacterAsset("nightSky", "mumu", "lonely"),
    },
  },
};

export const categoryAssets: Record<CategoryKey, string> = {
  basicRoutine: assetUrl("categories/cat-basic-routine.png"),
  spaceReset: assetUrl("categories/cat-space-reset.png"),
  miniExercise: assetUrl("categories/cat-mini-exercise.png"),
  moodCare: assetUrl("categories/cat-mood-care.png"),
  focusHelp: assetUrl("categories/cat-focus-help.png"),
  socialLight: assetUrl("categories/cat-social-light.png"),
  morning: assetUrl("categories/cat-basic-routine.png"),
  fitness: assetUrl("categories/cat-mini-exercise.png"),
  reading: assetUrl("categories/cat-focus-help.png"),
  mind: assetUrl("categories/cat-mood-care.png"),
};

export const brandAssets = {
  logomark: assetUrl("brand/logo/logomark.png"),
  logoWordmark: assetUrl("brand/logo/logo-wordmark.png"),
  logoWordmarkInverse: assetUrl("brand/logo/logo-wordmark-inverse.png"),
  favicon: assetUrl("brand/favicon.png"),
  ogImage: assetUrl("brand/og-image.png"),
  stardustPattern: assetUrl("pattern-stardust.svg"),
};

export const skinThumbnailAssets: Record<SkinThumbnailKey, string> = {
  starlight: assetUrl("skins/starlight/thumbnails/skin-starlight-thumbnail.png"),
  dawn: assetUrl("skins/dawn/thumbnails/skin-dawn-thumbnail.png"),
  nightSky: assetUrl("skins/night-sky/thumbnails/skin-night-sky-thumbnail.png"),
};

export const consumableItemAssets: Record<ConsumableItemAssetKey, string> = {
  FOOD: assetUrl("items/consumables/item-star-candy-meal.png"),
  REST: assetUrl("items/consumables/item-cloud-pillow.png"),
  PLAY: assetUrl("items/consumables/item-star-toy.png"),
};

export const attendanceAssets: Record<AttendanceAssetKey, string> = {
  stamp: assetUrl("attendance/stamps/attendance-stamp.png"),
  streak7: assetUrl("attendance/banners/attendance-streak-7.png"),
};

export const currencyAssets: Record<CurrencyAssetKey, string> = {
  starPiece: assetUrl("currency/star-piece-icon.png"),
};

export const emptyStateAssets: Record<EmptyStateAssetKey, string> = {
  mission: assetUrl("empty-states/empty-mission.png"),
  inventory: assetUrl("empty-states/empty-inventory.png"),
  notification: assetUrl("empty-states/empty-notification.png"),
  share: assetUrl("empty-states/empty-share.png"),
  careItem: assetUrl("empty-states/empty-care-item.png"),
  growth: assetUrl("empty-states/empty-growth.png"),
  memory: assetUrl("empty-states/empty-memory.png"),
  missionHistory: assetUrl("empty-states/empty-mission-history.png"),
  shop: assetUrl("empty-states/empty-shop.png"),
  talk: assetUrl("empty-states/empty-talk.png"),
  wallet: assetUrl("empty-states/empty-wallet.png"),
  weather: assetUrl("empty-states/empty-weather.png"),
  errorAi: assetUrl("empty-states/error-ai.png"),
  errorNetwork: assetUrl("empty-states/error-network.png"),
  errorRewardPending: assetUrl("empty-states/error-reward-pending.png"),
  errorServer: assetUrl("empty-states/error-server.png"),
  errorStarry: assetUrl("empty-states/error-starry.png"),
};

export const effectAssets: Record<EffectAssetKey, string> = {
  starParticle: assetUrl("effects/particles/effect-star-particle.png"),
  sparkleBurst: assetUrl("effects/particles/effect-sparkle-burst.png"),
  rewardStamp: assetUrl("effects/stamps/effect-reward-stamp.png"),
  expOrb: assetUrl("effects/growth/effect-exp-orb.png"),
  expTrail: assetUrl("effects/growth/effect-exp-trail.png"),
  growthSparkle: assetUrl("effects/growth/effect-growth-sparkle.png"),
  levelUpBurst: assetUrl("effects/growth/effect-level-up-burst.png"),
};

export const rewardEffectAssets: Record<RewardEffectAssetKey, string> = {
  paidStar: assetUrl("effects/rewards/reward-paid-star.png"),
  pendingClock: assetUrl("effects/rewards/reward-pending-clock.png"),
  failedSoft: assetUrl("effects/rewards/reward-failed-soft.png"),
  onceADay: assetUrl("effects/rewards/reward-once-a-day.png"),
  retrySpark: assetUrl("effects/rewards/reward-retry-spark.png"),
};

export const growthAssets: {
  badges: Record<GrowthStageKey, string>;
  auras: Record<GrowthStageKey, string>;
} = {
  badges: {
    baby: assetUrl("growth/badges/growth-badge-baby.png"),
    growing: assetUrl("growth/badges/growth-badge-growing.png"),
    mature: assetUrl("growth/badges/growth-badge-mature.png"),
  },
  auras: {
    baby: assetUrl("growth/auras/growth-aura-baby.png"),
    growing: assetUrl("growth/auras/growth-aura-growing.png"),
    mature: assetUrl("growth/auras/growth-aura-mature.png"),
  },
};

export const talkAssets: Record<TalkAssetKey, string> = {
  avatarMumu: assetUrl("talk/talk-avatar-mumu.png"),
  avatarNova: assetUrl("talk/talk-avatar-nova.png"),
  avatarJjori: assetUrl("talk/talk-avatar-jjori.png"),
  bubbleSparkle: assetUrl("talk/talk-bubble-sparkle.png"),
  loadingStar: assetUrl("talk/talk-loading-star.png"),
  panelBg: assetUrl("talk/talk-panel-bg.png"),
  sendSparkle: assetUrl("talk/talk-send-sparkle.png"),
  typingDots: assetUrl("talk/talk-typing-dots.png"),
};

export const memoryAssets: Record<MemoryAssetKey, string> = {
  fragmentCommon: assetUrl("memories/fragments/memory-fragment-common.png"),
  fragmentLore: assetUrl("memories/fragments/memory-fragment-lore.png"),
  fragmentEasterEgg: assetUrl("memories/fragments/memory-fragment-easter-egg.png"),
  cardBg: assetUrl("memories/states/memory-card-bg.png"),
  lockedStar: assetUrl("memories/states/memory-locked-star.png"),
  unlockedGlow: assetUrl("memories/states/memory-unlocked-glow.png"),
  unlockEffect: assetUrl("memories/states/effect-memory-unlock.png"),
};

export const weatherAssets: Record<WeatherAssetKey, string> = {
  sunny: assetUrl("weather/weather-sunny.png"),
  cloudy: assetUrl("weather/weather-cloudy.png"),
  rain: assetUrl("weather/weather-rain.png"),
  snow: assetUrl("weather/weather-snow.png"),
  hot: assetUrl("weather/weather-hot.png"),
  cold: assetUrl("weather/weather-cold.png"),
  night: assetUrl("weather/time-night.png"),
  midnight: assetUrl("weather/time-midnight.png"),
};

export const notificationAssets: Record<NotificationAssetKey, string> = {
  attendance: assetUrl("notifications/notification-attendance.png"),
  mission: assetUrl("notifications/notification-mission.png"),
  reward: assetUrl("notifications/notification-reward.png"),
  share: assetUrl("notifications/notification-share.png"),
  state: assetUrl("notifications/notification-state.png"),
  system: assetUrl("notifications/notification-system.png"),
};

export const shareCardAssets: {
  backgrounds: Record<ShareCardBackgroundKey, string>;
  characters: Record<CharacterKey, string>;
  decorations: Record<ShareCardDecorationKey, string>;
  stamps: Record<ShareCardStampKey, string>;
} = {
  backgrounds: {
    default: assetUrl("share-card/background/share-card-bg-default.png"),
    night: assetUrl("share-card/background/share-card-bg-night.png"),
    warm: assetUrl("share-card/background/share-card-bg-warm.png"),
  },
  characters: {
    nova: assetUrl("share-card/characters/share-card-character-nova.png"),
    jjori: assetUrl("share-card/characters/share-card-character-jjori.png"),
    mumu: assetUrl("share-card/characters/share-card-character-mumu.png"),
  },
  decorations: {
    stardust: assetUrl("share-card/decorations/share-card-deco-stardust.png"),
    friendsFrame: assetUrl("share-card/decorations/share-card-frame-friends.png"),
  },
  stamps: {
    complete: assetUrl("share-card/stamps/share-card-stamp-complete.png"),
  },
};

export type {
  AttendanceAssetKey,
  CategoryKey,
  CharacterGrowthAssetLevel,
  CharacterKey,
  CharacterMood,
  CharacterSkinKey,
  CharacterVisualState,
  ConsumableItemAssetKey,
  CurrencyAssetKey,
  EmptyStateAssetKey,
  EffectAssetKey,
  GrowthStageKey,
  MemoryAssetKey,
  NotificationAssetKey,
  RewardEffectAssetKey,
  ShareCardBackgroundKey,
  ShareCardDecorationKey,
  ShareCardStampKey,
  SkinThumbnailKey,
  TalkAssetKey,
  WeatherAssetKey,
};

function isCharacterMood(state: CharacterVisualState): state is CharacterMood {
  return state === "idle" || state === "happy" || state === "sleepy";
}

function buildCharacterGrowthStateAssets(
  character: CharacterKey,
  level: CharacterGrowthAssetLevel,
): Record<CharacterVisualState, string> {
  return {
    idle: characterGrowthAsset(character, level, "idle"),
    happy: characterGrowthAsset(character, level, "happy"),
    sleepy: characterGrowthAsset(character, level, "sleepy"),
    hungry: characterGrowthAsset(character, level, "hungry"),
    lowEnergy: characterGrowthAsset(character, level, "lowEnergy"),
    lonely: characterGrowthAsset(character, level, "lonely"),
  };
}

function toCharacterAssetFileState(state: CharacterVisualState) {
  return state === "lowEnergy" ? "low-energy" : state;
}
