export type CharacterTypeCode = "NOVA" | "MUMU" | "JJORI" | "JJORY";
export type CharacterKey = "nova" | "mumu" | "jjori";
export type CharacterStateGrade = "GOOD" | "NORMAL" | "BAD";

export type CharacterStatusValue = {
  value: number;
  label: string;
  grade: CharacterStateGrade;
};

export type CharacterStates = {
  hunger: CharacterStatusValue;
  energy: CharacterStatusValue;
  affection: CharacterStatusValue;
};

const codeToKey: Record<CharacterTypeCode, CharacterKey> = {
  NOVA: "nova",
  MUMU: "mumu",
  JJORI: "jjori",
  JJORY: "jjori",
};

const codeToCharacterTypeId: Record<CharacterTypeCode, number> = {
  NOVA: 1,
  MUMU: 2,
  JJORI: 3,
  JJORY: 3,
};

const characterTypeLabelById: Record<number, string> = {
  1: "노바",
  2: "무무",
  3: "쪼리",
};

export function toCharacterKey(code: CharacterTypeCode | string | null | undefined): CharacterKey {
  if (code === "MUMU" || code === "mumu") return "mumu";
  if (code === "JJORI" || code === "jjori" || code === "JJORY" || code === "jjory") return "jjori";
  if (code === "NOVA" || code === "nova") return "nova";

  return codeToKey.NOVA;
}

export function toCharacterTypeId(code: CharacterTypeCode | string | null | undefined) {
  if (code === "MUMU" || code === "mumu") return codeToCharacterTypeId.MUMU;
  if (code === "JJORI" || code === "jjori" || code === "JJORY" || code === "jjory") return codeToCharacterTypeId.JJORI;
  if (code === "NOVA" || code === "nova") return codeToCharacterTypeId.NOVA;

  return null;
}

export function getCharacterTypeLabelById(characterTypeId: number | null | undefined) {
  if (!characterTypeId) return "공용";

  return characterTypeLabelById[characterTypeId] ?? "전용";
}
