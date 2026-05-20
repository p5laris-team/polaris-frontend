import { type CharacterTypeCode } from "@/entities/character/types";

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

export type CharacterTypeListResponse = {
  items: CharacterTypeSummary[];
};

export type CreateCharacterRequest = {
  characterTypeId: number;
  name: string;
};

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

export type OnboardingQuestionKey =
  | "livingType"
  | "wakeUpTime"
  | "sleepTime"
  | "preferredMissionTime"
  | "routineGoal"
  | "activityPreference"
  | "missionIntensity";

export type OnboardingOption = {
  value: string;
  label: string;
  sub?: string;
};

export type OnboardingQuestion = {
  key: OnboardingQuestionKey;
  question: string;
  type: "SINGLE_CHOICE";
  options: OnboardingOption[];
  characterLine: string;
};

export type OnboardingQuestionsResponse = {
  items: OnboardingQuestion[];
};

export type OnboardingAnswers = Partial<Record<OnboardingQuestionKey, string>>;

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

export type SaveOnboardingProfileResponse = {
  completed: boolean;
  missionAvailable: boolean;
  completedAt: string;
};
