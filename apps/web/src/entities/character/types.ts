export type CharacterTypeCode = "NOVA" | "MUMU" | "JJORI";
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
};

export function toCharacterKey(code: CharacterTypeCode | string | null | undefined): CharacterKey {
  if (code === "MUMU" || code === "mumu") return "mumu";
  if (code === "JJORI" || code === "jjori") return "jjori";
  if (code === "NOVA" || code === "nova") return "nova";

  return codeToKey.NOVA;
}
