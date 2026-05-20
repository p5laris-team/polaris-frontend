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
      key: "livingType",
      question: "주로 어디서 생활하나요?",
      type: "SINGLE_CHOICE",
      characterLine: "무... 주로 머무는 곳을 알면 더 편한 미션을 찾을 수 있어요.",
      options: [
        { value: "LIVING_ALONE", label: "혼자 살아요", sub: "나만의 독립된 공간" },
        { value: "WITH_FAMILY", label: "가족과 살아요", sub: "함께 쓰는 따뜻한 집" },
        { value: "WITH_ROOMMATE", label: "룸메이트와 살아요", sub: "공유하는 생활 공간" },
      ],
    },
    {
      key: "wakeUpTime",
      question: "보통 몇 시에 일어나나요?",
      type: "SINGLE_CHOICE",
      characterLine: "아침 리듬을 알면 시작 미션을 너무 세게 주지 않을게요.",
      options: [
        { value: "06:00", label: "아침 6시 이전", sub: "일찍 하루를 여는 편" },
        { value: "08:00", label: "아침 6시 ~ 8시", sub: "보통의 아침 루틴" },
        { value: "10:00", label: "오전 8시 ~ 10시", sub: "조금 천천히 시작" },
        { value: "12:00", label: "오전 10시 이후", sub: "늦게 깨어나는 편" },
      ],
    },
    {
      key: "sleepTime",
      question: "보통 몇 시에 자나요?",
      type: "SINGLE_CHOICE",
      characterLine: "밤 리듬도 소중하니까, 무리하지 않는 미션을 고를게요.",
      options: [
        { value: "22:00", label: "밤 10시 이전", sub: "일찍 쉬는 편" },
        { value: "24:00", label: "밤 10시 ~ 12시", sub: "적당히 늦은 밤" },
        { value: "02:00", label: "새벽 12시 ~ 2시", sub: "새벽 감성이 있는 편" },
        { value: "04:00", label: "새벽 2시 이후", sub: "아주 늦게 잠드는 편" },
      ],
    },
    {
      key: "preferredMissionTime",
      question: "미션은 주로 언제 받고 싶나요?",
      type: "SINGLE_CHOICE",
      characterLine: "미션이 찾아오는 시간이 부담스럽지 않았으면 해요.",
      options: [
        { value: "MORNING", label: "아침", sub: "하루 시작을 가볍게" },
        { value: "AFTERNOON", label: "오후", sub: "중간에 숨 돌리기" },
        { value: "EVENING", label: "저녁", sub: "하루를 정리하며" },
        { value: "ANYTIME", label: "아무 때나", sub: "괜찮을 때 받기" },
      ],
    },
    {
      key: "routineGoal",
      question: "지금 가장 만들고 싶은 루틴은?",
      type: "SINGLE_CHOICE",
      characterLine: "작은 목표 하나만 알려줘요. 거기서부터 같이 걸어볼게요.",
      options: [
        { value: "SELF_CARE", label: "나를 챙기기", sub: "물, 식사, 휴식 같은 기본 돌봄" },
        { value: "SPACE_RESET", label: "공간 정리", sub: "방과 책상을 조금씩 정돈" },
        { value: "MOVEMENT", label: "몸 움직이기", sub: "산책과 스트레칭" },
        { value: "FOCUS", label: "집중 습관", sub: "읽기, 공부, 기록" },
      ],
    },
    {
      key: "activityPreference",
      question: "실내/실외 활동 중 어느 쪽이 편한가요?",
      type: "SINGLE_CHOICE",
      characterLine: "편한 장소에서 시작해야 별조각도 오래 모일 수 있어요.",
      options: [
        { value: "INDOOR", label: "실내가 좋아요", sub: "집 안에서 작게" },
        { value: "OUTDOOR", label: "실외도 괜찮아요", sub: "집 밖으로 살짝" },
        { value: "BOTH", label: "둘 다 괜찮아요", sub: "상황에 맞춰서" },
      ],
    },
    {
      key: "missionIntensity",
      question: "미션은 어느 정도 강도가 좋은가요?",
      type: "SINGLE_CHOICE",
      characterLine: "처음엔 작게 시작해도 충분해요. 진짜로요.",
      options: [
        { value: "LIGHT", label: "가벼운 미션", sub: "1~3분이면 충분" },
        { value: "NORMAL", label: "보통 미션", sub: "조금 집중해서" },
        { value: "CHALLENGE", label: "도전 미션", sub: "오늘은 조금 더 해보기" },
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
    completed: true,
    missionAvailable: true,
    completedAt,
  };
}
