type CharacterKey = "nova" | "jjori" | "mumu";
type CharacterMood = "idle" | "happy" | "sleepy";
type CategoryKey = "morning" | "fitness" | "reading" | "mind";
type SkinThumbnailKey = "starlight" | "dawn" | "nightSky";
type ConsumableItemAssetKey = "FOOD" | "REST" | "PLAY";

// Vite가 번들에 포함할 수 있도록 frontend 루트 assets/를 참조한다.
const assetUrl = (fileName: string) =>
  new URL(`../../../../../assets/${fileName}`, import.meta.url).href;

export const characterAssets: Record<CharacterKey, Record<CharacterMood, string>> = {
  nova: {
    idle: assetUrl("character-nova.png"),
    happy: assetUrl("character-nova-happy.png"),
    sleepy: assetUrl("character-nova-sleepy.png"),
  },
  jjori: {
    idle: assetUrl("character-jjori.png"),
    happy: assetUrl("character-jjori-happy.png"),
    sleepy: assetUrl("character-jjori-sleepy.png"),
  },
  mumu: {
    idle: assetUrl("character-mumu.png"),
    happy: assetUrl("character-mumu-happy.png"),
    sleepy: assetUrl("character-mumu-sleepy.png"),
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

export type {
  CategoryKey,
  CharacterKey,
  CharacterMood,
  ConsumableItemAssetKey,
  SkinThumbnailKey,
};
