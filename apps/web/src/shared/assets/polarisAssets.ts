type CharacterKey = "nova" | "jjori" | "mumu";
type CharacterMood = "idle" | "happy" | "sleepy";
type CharacterVisualState = CharacterMood | "hungry" | "lowEnergy" | "lonely";
type CategoryKey = "morning" | "fitness" | "reading" | "mind";
type SkinThumbnailKey = "starlight" | "dawn" | "nightSky";
type CharacterSkinKey = SkinThumbnailKey;
type ConsumableItemAssetKey = "FOOD" | "REST" | "PLAY";
type EmptyStateAssetKey = "mission" | "inventory" | "notification" | "share";
type ShareCardBackgroundKey = "default" | "night" | "warm";
type ShareCardDecorationKey = "stardust" | "friendsFrame";
type ShareCardStampKey = "complete";

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
  morning: assetUrl("cat-morning.svg"),
  fitness: assetUrl("cat-fitness.svg"),
  reading: assetUrl("cat-reading.svg"),
  mind: assetUrl("cat-mind.svg"),
};

export const brandAssets = {
  logomark: assetUrl("logomark.svg"),
  logoWordmark: assetUrl("logo-wordmark.svg"),
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

export const emptyStateAssets: Record<EmptyStateAssetKey, string> = {
  mission: assetUrl("empty-states/empty-mission.png"),
  inventory: assetUrl("empty-states/empty-inventory.png"),
  notification: assetUrl("empty-states/empty-notification.png"),
  share: assetUrl("empty-states/empty-share.png"),
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
  CategoryKey,
  CharacterKey,
  CharacterMood,
  CharacterSkinKey,
  CharacterVisualState,
  ConsumableItemAssetKey,
  EmptyStateAssetKey,
  ShareCardBackgroundKey,
  ShareCardDecorationKey,
  ShareCardStampKey,
  SkinThumbnailKey,
};

function isCharacterMood(state: CharacterVisualState): state is CharacterMood {
  return state === "idle" || state === "happy" || state === "sleepy";
}

function toCharacterAssetFileState(state: CharacterVisualState) {
  return state === "lowEnergy" ? "low-energy" : state;
}
