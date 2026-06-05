import { type CharacterGrowth } from "@/entities/character/types";

export const SKIN_UNLOCK_LEVEL = 3;

export function canUseCharacterSkins(growth: CharacterGrowth | null | undefined) {
  return (growth?.level ?? 1) >= SKIN_UNLOCK_LEVEL;
}

export function getSkinUnlockLabel(growth: CharacterGrowth | null | undefined) {
  const level = growth?.level ?? 1;

  if (level >= SKIN_UNLOCK_LEVEL) {
    return "스킨 구매와 장착이 가능해요.";
  }

  return `Lv.${SKIN_UNLOCK_LEVEL}부터 스킨을 구매하고 장착할 수 있어요.`;
}

export function getSkinUnlockCompactLabel(growth: CharacterGrowth | null | undefined) {
  const level = growth?.level ?? 1;

  if (level >= SKIN_UNLOCK_LEVEL) {
    return "스킨 구매/장착 가능";
  }

  return `Lv.${SKIN_UNLOCK_LEVEL}부터 구매/장착 가능`;
}
