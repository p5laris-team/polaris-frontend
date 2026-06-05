/**
 * 캐릭터 도메인에서 여러 feature가 공유하는 타입과 변환 함수입니다.
 * 백엔드 enum 이름과 프론트 asset key가 다르기 때문에 여기서 한 번 정규화합니다.
 */

/** 백엔드가 내려주는 캐릭터 타입 코드입니다. JJORY는 기존 오타/별칭 호환을 위해 JJORI와 같은 캐릭터로 처리합니다. */
export type CharacterTypeCode = "NOVA" | "MUMU" | "JJORI" | "JJORY";

/** 프론트 이미지 asset registry에서 쓰는 캐릭터 key입니다. */
export type CharacterKey = "nova" | "mumu" | "jjori";

/** 캐릭터 상태 수치의 등급입니다. GOOD은 좋은 상태, NORMAL은 보통, BAD는 돌봄이 필요한 상태입니다. */
export type CharacterStateGrade = "GOOD" | "NORMAL" | "BAD";

/** 캐릭터 이미지가 표현할 수 있는 기본 상태 key입니다. */
export type CharacterAssetKey = "idle" | "happy" | "sleepy" | "hungry" | "lowEnergy" | "lonely";

/** 백엔드 CDN 이미지 URL 모음입니다. 프론트 로컬 asset이 없을 때 fallback으로 사용합니다. */
export type CharacterAssetUrls = Partial<Record<CharacterAssetKey, string>> & Record<string, string | undefined>;

/** 캐릭터 성장 단계입니다. 프론트 성장 에셋은 BABY=lv1, GROWING=lv2, MATURE=lv3로 연결합니다. */
export type CharacterGrowthStage = "BABY" | "GROWING" | "MATURE";

/** hunger/energy/affection 각각의 수치, 라벨, 등급을 담는 공통 구조입니다. */
export type CharacterStatusValue = {
  value: number;
  label: string;
  grade: CharacterStateGrade;
};

/** 별친구의 핵심 상태 3종입니다. 화면에서는 게이지와 표정 결정에 사용됩니다. */
export type CharacterStates = {
  hunger: CharacterStatusValue;
  energy: CharacterStatusValue;
  affection: CharacterStatusValue;
};

/** 별친구의 성장 스냅샷입니다. 홈/별친구/미션 완료 결과에서 같은 구조로 사용합니다. */
export type CharacterGrowth = {
  level: number;
  exp: number;
  currentLevelExp: number;
  nextLevelExp: number;
  expToNextLevel: number;
  progressPercent: number;
  growthStage: CharacterGrowthStage | string;
  growthStageLabel: string;
  maxLevel: boolean;
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

/** 백엔드 캐릭터 코드를 프론트 asset key로 변환합니다. 모르는 값은 기본 캐릭터 nova로 안전하게 처리합니다. */
export function toCharacterKey(code: CharacterTypeCode | string | null | undefined): CharacterKey {
  if (code === "MUMU" || code === "mumu") return "mumu";
  if (code === "JJORI" || code === "jjori" || code === "JJORY" || code === "jjory") return "jjori";
  if (code === "NOVA" || code === "nova") return "nova";

  return codeToKey.NOVA;
}

/** 백엔드 캐릭터 코드를 상점/보관함 필터에서 쓰는 characterTypeId로 변환합니다. */
export function toCharacterTypeId(code: CharacterTypeCode | string | null | undefined) {
  if (code === "MUMU" || code === "mumu") return codeToCharacterTypeId.MUMU;
  if (code === "JJORI" || code === "jjori" || code === "JJORY" || code === "jjory") return codeToCharacterTypeId.JJORI;
  if (code === "NOVA" || code === "nova") return codeToCharacterTypeId.NOVA;

  return null;
}

/** characterTypeId를 사용자에게 보이는 캐릭터 이름 또는 공용 라벨로 변환합니다. */
export function getCharacterTypeLabelById(characterTypeId: number | null | undefined) {
  if (!characterTypeId) return "공용";

  return characterTypeLabelById[characterTypeId] ?? "전용";
}
