/**
 * 온보딩과 캐릭터 생성에서 쓰는 타입입니다.
 * 캐릭터 선택, 이름 생성, 생활 패턴 질문 저장까지 첫 실행 흐름의 계약을 모아 둡니다.
 */
import { type CharacterTypeCode } from "@/entities/character/types";

/** 선택 가능한 별친구 타입 한 개의 요약 정보입니다. */
export type CharacterTypeSummary = {
  id: number;
  code: CharacterTypeCode;
  name: string;
  summary: string;
  sampleLine: string;
  sortOrder: number;
  tags: string[];
  description: string;
};

/** 캐릭터 타입 목록 응답입니다. */
export type CharacterTypeListResponse = {
  items: CharacterTypeSummary[];
};

/** 별친구 이름 정하기 단계에서 캐릭터 생성 API로 보내는 요청입니다. */
export type CreateCharacterRequest = {
  characterTypeId: number;
  name: string;
};

/** 생성된 별친구 응답입니다. active=true이면 현재 사용자의 활성 캐릭터입니다. */
export type CreatedCharacterResponse = {
  id: number;
  name: string;
  characterTypeCode: CharacterTypeCode;
  active: boolean;
  states: {
    hunger: number;
    energy: number;
    affection: number;
  };
  createdAt: string;
};

/** 온보딩 7문항의 고정 key입니다. 저장 API 필드명과 직접 연결됩니다. */
export type OnboardingQuestionKey =
  | "livingType"
  | "wakeUpTime"
  | "sleepTime"
  | "preferredMissionTime"
  | "routineGoal"
  | "activityPreference"
  | "missionIntensity";

/** 단일 선택 문항의 선택지입니다. sub는 보조 설명입니다. */
export type OnboardingOption = {
  value: string;
  label: string;
  sub?: string;
};

/** 온보딩 질문 한 개입니다. 현재는 SINGLE_CHOICE만 사용합니다. */
export type OnboardingQuestion = {
  key: OnboardingQuestionKey;
  question: string;
  type: "SINGLE_CHOICE";
  options: OnboardingOption[];
  characterLine: string;
};

/** 온보딩 질문 목록 응답입니다. */
export type OnboardingQuestionsResponse = {
  items: OnboardingQuestion[];
};

/** 사용자가 아직 답하지 않은 문항이 있을 수 있으므로 Partial로 보관합니다. */
export type OnboardingAnswers = Partial<Record<OnboardingQuestionKey, string>>;

/** 저장된 온보딩 프로필입니다. completed=false이면 홈 대신 온보딩으로 보냅니다. */
export type OnboardingProfileResponse = {
  completed: boolean;
  livingType?: string;
  wakeUpTime?: string;
  sleepTime?: string;
  preferredMissionTime?: string;
  routineGoal?: string;
  activityPreference?: string;
  missionIntensity?: string;
  completedAt?: string;
};

/** 온보딩 완료 저장 요청입니다. 개별 필드와 원본 answers record를 함께 보냅니다. */
export type SaveOnboardingProfileRequest = Required<
  Pick<
    OnboardingProfileResponse,
    | "livingType"
    | "wakeUpTime"
    | "sleepTime"
    | "preferredMissionTime"
    | "routineGoal"
    | "activityPreference"
    | "missionIntensity"
  >
> & {
  answers: Record<string, string>;
  completed: boolean;
};

/** 온보딩 저장 결과입니다. missionAvailable은 홈에서 미션을 시작할 수 있는지 판단하는 힌트입니다. */
export type SaveOnboardingProfileResponse = {
  completed: boolean;
  missionAvailable: boolean;
  completedAt: string;
};
