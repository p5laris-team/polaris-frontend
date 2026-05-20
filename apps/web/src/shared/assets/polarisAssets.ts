type CharacterKey = "nova" | "jjori" | "mumu";
type CharacterMood = "idle" | "happy" | "sleepy";
type CategoryKey = "morning" | "fitness" | "reading" | "mind";

// 기존 디자인 기준 프로젝트의 assets/를 복사하지 않고 실제 앱에서 그대로 참조한다.
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

export type { CategoryKey, CharacterKey, CharacterMood };
