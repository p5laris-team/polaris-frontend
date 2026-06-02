import { demoApplyCreatedCharacter } from "@/features/home/model/homeFixture";
import {
  type CharacterTypeListResponse,
  type CharacterTypeSummary,
  type CreateCharacterRequest,
  type CreatedCharacterResponse,
  type OnboardingProfileResponse,
  type OnboardingQuestionsResponse,
  type SaveOnboardingProfileRequest,
  type SaveOnboardingProfileResponse,
} from "@/features/onboarding/model/onboardingTypes";

export const demoCharacterTypes: CharacterTypeSummary[] = [
  {
    id: 1,
    code: "NOVA",
    name: "노바",
    summary: "별이 내려앉은 알친구",
    sampleLine: "오늘도... 있었네.",
    sortOrder: 1,
    tags: ["다정함", "기억 수집", "느린 응원"],
    description:
      "자기가 한때 하늘의 길을 비추던 별이었다는 걸 까먹은 별알이에요. 작은 일을 해낼 때마다 빛을 되찾아요.",
  },
  {
    id: 2,
    code: "MUMU",
    name: "무무",
    summary: "말 없는 아기 나무밑둥",
    sampleLine: "무...",
    sortOrder: 2,
    tags: ["공감형", "새싹돋음", "느긋함"],
    description:
      "오래 기다리다 말을 잃어버리고 '무...'로 감정을 전해요. 행동을 실천할 때마다 잎을 파르르 떨며 기뻐합니다.",
  },
  {
    id: 3,
    code: "JJORI",
    name: "쪼리",
    summary: "가방 멘 허세 별쥐",
    sampleLine: "집 앞도 밖임. 반박 안 받음.",
    sortOrder: 3,
    tags: ["현실파", "시크함", "원정러"],
    description:
      "늘 배낭을 메고 있지만 먼 여행은 가본 적이 없어요. 현관문 밖으로 나서는 일도 위대한 원정이라 믿습니다.",
  },
];

export const demoOnboardingQuestions: OnboardingQuestionsResponse = {
  items: [
    {
      key: "preferredMissionTime",
      question: "미션을 받기 편한 시간은 언제인가요?",
      type: "MULTI_CHOICE",
      multipleSelection: true,
      maxSelectionCount: 2,
      characterLine: "편한 시간을 골라주면 미션이 너무 엉뚱한 때 찾아가지 않게 할게요.",
      options: [
        { value: "MORNING", label: "아침", sub: "하루 시작을 가볍게" },
        { value: "AFTERNOON", label: "오후", sub: "중간에 숨 돌리기" },
        { value: "EVENING", label: "저녁", sub: "하루를 정리하며" },
        { value: "NIGHT", label: "밤", sub: "조용한 시간에 작게" },
      ],
    },
    {
      key: "routineGoal",
      question: "지금 만들고 싶은 루틴은 무엇인가요?",
      type: "MULTI_CHOICE",
      multipleSelection: true,
      maxSelectionCount: 3,
      characterLine: "하고 싶은 루틴을 몇 개 골라줘요. 별친구가 섞어서 제안해볼게요.",
      options: [
        { value: "SELF_CARE", label: "나를 챙기기", sub: "물, 식사, 휴식 같은 기본 돌봄" },
        { value: "SPACE_RESET", label: "공간 정리", sub: "방과 책상을 조금씩 정돈" },
        { value: "MOVEMENT", label: "몸 움직이기", sub: "산책과 스트레칭" },
        { value: "FOCUS", label: "집중 습관", sub: "읽기, 공부, 기록" },
        { value: "MOOD_CARE", label: "마음 돌보기", sub: "감정 정리와 작은 위로" },
        { value: "SOCIAL_LIGHT", label: "가벼운 관계", sub: "안부와 짧은 소통" },
      ],
    },
    {
      key: "missionPlaceContext",
      question: "주로 어디에서 할 수 있는 미션이 편한가요?",
      type: "MULTI_CHOICE",
      multipleSelection: true,
      maxSelectionCount: 3,
      characterLine: "회사, 집, 밖에서도 어색하지 않게 작은 미션을 골라볼게요.",
      options: [
        { value: "HOME", label: "집", sub: "혼자 있을 때 부담 없이" },
        { value: "WORKPLACE", label: "회사/학교", sub: "주변 눈치가 덜 보이게" },
        { value: "OUTSIDE", label: "외출 중", sub: "길 위에서도 짧게" },
        { value: "ANYWHERE", label: "어디든 괜찮아요", sub: "상황에 맞춰서" },
      ],
    },
    {
      key: "missionIntensity",
      question: "미션은 어느 정도 강도가 좋은가요?",
      type: "SINGLE_CHOICE",
      multipleSelection: false,
      maxSelectionCount: 1,
      characterLine: "처음엔 작게 시작해도 충분해요. 진짜로요.",
      options: [
        { value: "LIGHT", label: "가벼운 미션", sub: "1~3분이면 충분" },
        { value: "NORMAL", label: "보통 미션", sub: "조금 집중해서" },
        { value: "CHALLENGE", label: "도전 미션", sub: "오늘은 조금 더 해보기" },
      ],
    },
    {
      key: "avoidedMissionTags",
      question: "피하고 싶은 미션이 있나요?",
      type: "MULTI_CHOICE",
      multipleSelection: true,
      maxSelectionCount: 3,
      characterLine: "싫은 건 피해서 가도 괜찮아요. 오래 가는 루틴이 더 중요하니까요.",
      options: [
        { value: "OUTDOOR_REQUIRED", label: "밖에 꼭 나가야 하는 미션", sub: "실내 위주로 받고 싶어요" },
        { value: "SOCIAL_REQUIRED", label: "누군가에게 연락하는 미션", sub: "혼자 하는 게 편해요" },
        { value: "LONG_FOCUS", label: "오래 집중해야 하는 미션", sub: "짧게 끊어서 하고 싶어요" },
        { value: "CLEANING", label: "정리/청소 미션", sub: "지금은 다른 루틴이 좋아요" },
      ],
    },
  ],
};

let demoProfile: OnboardingProfileResponse = {
  completed: false,
};

export function demoGetCharacterTypes(): CharacterTypeListResponse {
  return {
    items: [...demoCharacterTypes].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export function demoCreateCharacter(body: CreateCharacterRequest): CreatedCharacterResponse {
  const characterType = demoCharacterTypes.find((type) => type.id === body.characterTypeId);

  if (!characterType) {
    throw new Error("선택한 별친구를 찾지 못했어요.");
  }

  const character: CreatedCharacterResponse = {
    id: 10,
    name: body.name,
    characterTypeCode: characterType.code,
    active: true,
    states: {
      hunger: 70,
      energy: 70,
      affection: 50,
    },
    createdAt: new Date().toISOString(),
  };

  demoApplyCreatedCharacter(character);

  return character;
}

export function demoGetOnboardingProfile(): OnboardingProfileResponse {
  return { ...demoProfile };
}

export function demoSaveOnboardingProfile(
  body: SaveOnboardingProfileRequest,
): SaveOnboardingProfileResponse {
  const completedAt = new Date().toISOString();

  demoProfile = {
    ...body,
    completed: body.completed,
    completedAt,
  };

  return {
    ...demoProfile,
  };
}
