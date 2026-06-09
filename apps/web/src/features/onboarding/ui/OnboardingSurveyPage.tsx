/**
 * 온보딩 3단계, 루틴 질문 화면입니다.
 * 사용자의 생활 패턴 답변 7개를 store에 모았다가 마지막 단계에서 백엔드 프로필 저장 API로 전송합니다.
 */
import { Check } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toCharacterKey } from "@/entities/character/types";
import { useActiveCharacterQuery } from "@/features/character/api/characterCareApi";
import {
  useOnboardingQuestionsQuery,
  useOnboardingProfileQuery,
  useSaveOnboardingProfileMutation,
} from "@/features/onboarding/api/onboardingApi";
import { useOnboardingSetupStore } from "@/features/onboarding/model/onboardingStore";
import {
  type OnboardingAnswers,
  type OnboardingProfileResponse,
  type OnboardingQuestion,
  type OnboardingQuestionKey,
  type SaveOnboardingProfileRequest,
} from "@/features/onboarding/model/onboardingTypes";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { emptyStateAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, CharacterStage, ErrorState, Header, useToast } from "@/shared/ui";

import "./OnboardingFlow.css";

type OnboardingSurveyPageProps = {
  mode?: "setup" | "edit";
};

export function OnboardingSurveyPage({ mode = "setup" }: OnboardingSurveyPageProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = mode === "edit";
  const questionsQuery = useOnboardingQuestionsQuery();
  const profileQuery = useOnboardingProfileQuery(isEditMode);
  const activeCharacterQuery = useActiveCharacterQuery(isEditMode);
  const saveProfileMutation = useSaveOnboardingProfileMutation();
  const selectedCharacter = useOnboardingSetupStore((state) => state.selectedCharacter);
  const createdCharacter = useOnboardingSetupStore((state) => state.createdCharacter);
  const setupAnswers = useOnboardingSetupStore((state) => state.answers);
  const setAnswer = useOnboardingSetupStore((state) => state.setAnswer);
  const markCompleted = useOnboardingSetupStore((state) => state.markCompleted);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editAnswers, setEditAnswers] = useState<OnboardingAnswers>({});
  const [profileAnswersLoaded, setProfileAnswersLoaded] = useState(false);
  const answers = isEditMode ? editAnswers : setupAnswers;

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    if (!selectedCharacter) {
      navigate(routes.onboardingCharacter, { replace: true });
      return;
    }

    if (!createdCharacter) {
      navigate(routes.onboardingCharacterName, { replace: true });
    }
  }, [createdCharacter, isEditMode, navigate, selectedCharacter]);

  useEffect(() => {
    if (!isEditMode || profileAnswersLoaded || !profileQuery.data) {
      return;
    }

    setEditAnswers(mapProfileToAnswers(profileQuery.data));
    setProfileAnswersLoaded(true);
  }, [isEditMode, profileAnswersLoaded, profileQuery.data]);

  const questions = questionsQuery.data?.items ?? [];
  const currentQuestion = questions[currentIndex];
  const selectedValue = currentQuestion ? answers[currentQuestion.key] : undefined;
  const total = questions.length;
  const activeCharacter = activeCharacterQuery.data;
  const screenCharacterName = isEditMode
    ? activeCharacter?.name ?? createdCharacter?.name ?? "별친구"
    : createdCharacter?.name ?? "별친구";
  const screenCharacterTypeCode = isEditMode
    ? activeCharacter?.characterTypeCode ?? createdCharacter?.characterTypeCode ?? "NOVA"
    : createdCharacter?.characterTypeCode ?? "NOVA";
  const characterKey = toCharacterKey(screenCharacterTypeCode);
  const isInitialLoading = questionsQuery.isLoading || (isEditMode && profileQuery.isLoading);
  const pageError = questionsQuery.error ?? (isEditMode ? profileQuery.error : null);
  const answeredCount = useMemo(
    () => questions.filter((question) => hasAnswered(answers[question.key])).length,
    [answers, questions],
  );
  const progress = total ? ((currentIndex + 1) / total) * 100 : 0;

  /** 현재 문항 답변을 확인하고, 마지막 문항에서는 온보딩 프로필 저장까지 수행합니다. */
  const handleNext = async () => {
    if (!currentQuestion) return;

    if (!hasAnswered(selectedValue)) {
      showToast("현재 문항의 답을 먼저 골라 주세요.");
      return;
    }

    if (currentIndex < total - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    const request = buildSaveRequest(questions, answers);

    if (!request) {
      const firstMissingIndex = questions.findIndex((question) => !hasAnswered(answers[question.key]));
      setCurrentIndex(firstMissingIndex >= 0 ? firstMissingIndex : currentIndex);
      showToast("아직 답하지 않은 온보딩 문항이 있어요.");
      return;
    }

    try {
      await saveProfileMutation.mutateAsync(request);
      markCompleted();
      if (isEditMode) {
        showToast("미션 취향을 저장했어요.");
        navigate(routes.myPage, { replace: true });
      } else {
        showToast("온보딩이 완료됐어요. 오늘의 별조각을 모아볼까요?");
        navigate(routes.home, { replace: true });
      }
    } catch (error) {
      showToast(getUserFacingErrorMessage(error));
    }
  };

  const handleSelectOption = (question: OnboardingQuestion, optionValue: string) => {
    const nextAnswerValue = getNextAnswerValue(question, answers[question.key], optionValue);

    if (isEditMode) {
      setEditAnswers((current) => ({
        ...current,
        [question.key]: nextAnswerValue,
      }));
      return;
    }

    setAnswer(question.key, nextAnswerValue);
  };

  if (!isEditMode && (!selectedCharacter || !createdCharacter)) {
    return null;
  }

  return (
    <main className="onboarding-page">
      <AppShell>
        <div className="onboarding-flow">
          <Header
            title={isEditMode ? "미션 취향 수정" : "온보딩 질문"}
            onBack={() =>
              currentIndex > 0
                ? setCurrentIndex((index) => index - 1)
                : navigate(isEditMode ? routes.myPage : routes.onboardingCharacterName)
            }
          />

          <section className="onboarding-flow__body">
            {/* SCR-005 온보딩 v2: API 문항 순서와 multipleSelection 정책을 그대로 따라 답변을 저장한다. */}
            {isInitialLoading ? (
              <OnboardingState
                title={isEditMode ? "저장된 취향을 불러오는 중" : "질문을 준비하는 중"}
                description={
                  isEditMode
                    ? "지금 미션 개인화 설정을 정리하고 있어요."
                    : "별친구가 루틴 질문을 정리하고 있어요."
                }
              />
            ) : null}

            {pageError ? (
              <ErrorState
                className="onboarding-flow__state"
                title={isEditMode ? "미션 취향을 못 불러왔어요" : "질문을 못 불러왔어요"}
                description={getUserFacingErrorMessage(pageError)}
                imageSrc={emptyStateAssets.mission}
                onAction={() => {
                  void questionsQuery.refetch();
                  if (isEditMode) {
                    void profileQuery.refetch();
                  }
                }}
              />
            ) : null}

            {currentQuestion ? (
              <>
                <div className="onboarding-survey__top">
                  <div className="onboarding-survey__progress-meta">
                    <span>
                      {currentIndex + 1}/{total}
                    </span>
                    <span>{answeredCount}개 답변</span>
                  </div>
                  <div className="onboarding-survey__progress" aria-label="온보딩 진행률">
                    <div className="onboarding-survey__progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                  <CharacterStage
                    bubble={currentQuestion.characterLine}
                    character={characterKey}
                    mood={hasAnswered(selectedValue) ? "happy" : "idle"}
                    name={screenCharacterName}
                  />
                </div>

                <article className="onboarding-survey__question">
                  <h2>{currentQuestion.question}</h2>
                  {currentQuestion.multipleSelection ? (
                    <p className="onboarding-survey__hint">
                      최대 {currentQuestion.maxSelectionCount}개까지 고를 수 있어요.
                    </p>
                  ) : null}
                  <div className="onboarding-survey__options">
                    {currentQuestion.options.map((option) => {
                      const selected = isOptionSelected(selectedValue, option.value);

                      return (
                        <button
                          aria-pressed={selected}
                          className={`onboarding-survey__option ${
                            selected ? "onboarding-survey__option--selected" : ""
                          }`.trim()}
                          key={option.value}
                          onClick={() => handleSelectOption(currentQuestion, option.value)}
                          type="button"
                        >
                          <span className="onboarding-survey__option-text">
                            <strong>{option.label}</strong>
                            {option.sub ? <span>{option.sub}</span> : null}
                          </span>
                          <span className="onboarding-survey__option-mark" aria-hidden="true">
                            <Check size={15} strokeWidth={2.4} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </article>
              </>
            ) : null}
          </section>

          <div className="onboarding-flow__actions">
            <div className="onboarding-survey__nav">
              <Button
                disabled={currentIndex === 0 || saveProfileMutation.isPending}
                variant="secondary"
                onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
              >
                이전
              </Button>
              <Button disabled={!hasAnswered(selectedValue) || saveProfileMutation.isPending} onClick={handleNext}>
                {saveProfileMutation.isPending
                  ? "저장 중..."
                  : currentIndex === total - 1
                    ? isEditMode
                      ? "저장하고 돌아가기"
                      : "완료하고 홈으로"
                    : "다음"}
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    </main>
  );
}

/** 화면 답변 객체를 백엔드 v2 리스트 필드와 원본 answers record로 변환합니다. */
function buildSaveRequest(
  questions: OnboardingQuestion[],
  answers: OnboardingAnswers,
): SaveOnboardingProfileRequest | null {
  // 질문 목록은 서버 정책의 SoT라서, 화면은 내려온 문항 전체를 필수 답변으로 본다.
  const missingQuestion = questions.find((question) => !hasAnswered(answers[question.key]));

  if (missingQuestion) {
    return null;
  }

  const answerRecord = Object.fromEntries(
    questions.map((question) => [question.key, answers[question.key] ?? ""]),
  );
  const routineGoals = toAnswerArray(answers.routineGoal);
  const preferredTimeSlots = toAnswerArray(answers.preferredMissionTime);
  const missionPlaceContexts = toAnswerArray(answers.missionPlaceContext);
  const avoidedMissionTags = toAnswerArray(answers.avoidedMissionTags);
  const missionIntensity = toAnswerArray(answers.missionIntensity)[0] ?? "";

  return {
    onboardingVersion: 2,
    routineGoals,
    preferredTimeSlots,
    missionPlaceContexts,
    avoidedMissionTags,
    missionIntensity,
    routineGoal: routineGoals[0] ?? "",
    preferredMissionTime: preferredTimeSlots[0] ?? "",
    answers: answerRecord,
    completed: true,
  };
}

/** 저장된 온보딩 프로필을 질문 화면의 선택 상태로 복원합니다. */
function mapProfileToAnswers(profile: OnboardingProfileResponse): OnboardingAnswers {
  const savedAnswers = parseAnswersJson(profile.answersJson);

  return {
    ...savedAnswers,
    preferredMissionTime:
      savedAnswers.preferredMissionTime ??
      toProfileAnswerValue(profile.preferredTimeSlots, profile.preferredMissionTime),
    routineGoal:
      savedAnswers.routineGoal ??
      toProfileAnswerValue(profile.routineGoals, profile.routineGoal ?? profile.activityPreference),
    missionPlaceContext:
      savedAnswers.missionPlaceContext ??
      toProfileAnswerValue(profile.missionPlaceContexts, undefined),
    missionIntensity:
      savedAnswers.missionIntensity ??
      toProfileAnswerValue(undefined, profile.missionIntensity),
    avoidedMissionTags:
      savedAnswers.avoidedMissionTags ??
      toProfileAnswerValue(profile.avoidedMissionTags, undefined),
  };
}

function parseAnswersJson(value: string | undefined) {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([key, answerValue]) => isOnboardingQuestionKey(key) && isOnboardingAnswerValue(answerValue),
      ),
    ) as OnboardingAnswers;
  } catch {
    return {};
  }
}

function toProfileAnswerValue(
  values: string[] | undefined,
  fallback: string | undefined,
) {
  const normalizedValues = values?.filter(Boolean) ?? [];

  if (normalizedValues.length) {
    return normalizedValues;
  }

  return fallback || undefined;
}

function isOnboardingQuestionKey(value: string): value is OnboardingQuestionKey {
  return onboardingQuestionKeys.includes(value as OnboardingQuestionKey);
}

function isOnboardingAnswerValue(value: unknown): value is OnboardingAnswers[keyof OnboardingAnswers] {
  if (typeof value === "string") {
    return true;
  }

  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

const onboardingQuestionKeys: OnboardingQuestionKey[] = [
  "preferredMissionTime",
  "routineGoal",
  "missionPlaceContext",
  "missionIntensity",
  "avoidedMissionTags",
];

function hasAnswered(value: OnboardingAnswers[keyof OnboardingAnswers] | undefined) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return Boolean(value);
}

function isOptionSelected(
  value: OnboardingAnswers[keyof OnboardingAnswers] | undefined,
  optionValue: string,
) {
  if (Array.isArray(value)) {
    return value.includes(optionValue);
  }

  return value === optionValue;
}

function getNextAnswerValue(
  question: OnboardingQuestion,
  currentValue: OnboardingAnswers[keyof OnboardingAnswers] | undefined,
  optionValue: string,
) {
  if (!question.multipleSelection) {
    return optionValue;
  }

  const currentValues = toAnswerArray(currentValue);
  if (currentValues.includes(optionValue)) {
    return currentValues.filter((value) => value !== optionValue);
  }

  const maxSelectionCount = Math.max(1, question.maxSelectionCount || 1);
  return [...currentValues, optionValue].slice(-maxSelectionCount);
}

function toAnswerArray(value: OnboardingAnswers[keyof OnboardingAnswers] | undefined) {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

/** 온보딩 화면에서 로딩/에러 같은 단순 상태를 같은 레이아웃으로 보여줍니다. */
function OnboardingState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="onboarding-flow__state">
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
