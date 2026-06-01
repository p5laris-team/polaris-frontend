/**
 * 온보딩 3단계, 루틴 질문 화면입니다.
 * 사용자의 생활 패턴 답변 7개를 store에 모았다가 마지막 단계에서 백엔드 프로필 저장 API로 전송합니다.
 */
import { Check } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toCharacterKey } from "@/entities/character/types";
import {
  useOnboardingQuestionsQuery,
  useSaveOnboardingProfileMutation,
} from "@/features/onboarding/api/onboardingApi";
import { useOnboardingSetupStore } from "@/features/onboarding/model/onboardingStore";
import {
  type OnboardingAnswers,
  type OnboardingQuestion,
  type SaveOnboardingProfileRequest,
} from "@/features/onboarding/model/onboardingTypes";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { emptyStateAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, CharacterStage, ErrorState, Header, useToast } from "@/shared/ui";

import "./OnboardingFlow.css";

export function OnboardingSurveyPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const questionsQuery = useOnboardingQuestionsQuery();
  const saveProfileMutation = useSaveOnboardingProfileMutation();
  const selectedCharacter = useOnboardingSetupStore((state) => state.selectedCharacter);
  const createdCharacter = useOnboardingSetupStore((state) => state.createdCharacter);
  const answers = useOnboardingSetupStore((state) => state.answers);
  const setAnswer = useOnboardingSetupStore((state) => state.setAnswer);
  const markCompleted = useOnboardingSetupStore((state) => state.markCompleted);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!selectedCharacter) {
      navigate(routes.onboardingCharacter, { replace: true });
      return;
    }

    if (!createdCharacter) {
      navigate(routes.onboardingCharacterName, { replace: true });
    }
  }, [createdCharacter, navigate, selectedCharacter]);

  const questions = questionsQuery.data?.items ?? [];
  const currentQuestion = questions[currentIndex];
  const selectedValue = currentQuestion ? answers[currentQuestion.key] : undefined;
  const total = questions.length;
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
      showToast("온보딩이 완료됐어요. 오늘의 별조각을 모아볼까요?");
      navigate(routes.home, { replace: true });
    } catch (error) {
      showToast(getUserFacingErrorMessage(error));
    }
  };

  if (!selectedCharacter || !createdCharacter) {
    return null;
  }

  const characterKey = toCharacterKey(createdCharacter.characterTypeCode);

  return (
    <main className="onboarding-page">
      <AppShell>
        <div className="onboarding-flow">
          <Header
            title="온보딩 질문"
            onBack={() =>
              currentIndex > 0
                ? setCurrentIndex((index) => index - 1)
                : navigate(routes.onboardingCharacterName)
            }
          />

          <section className="onboarding-flow__body">
            {/* SCR-005 온보딩 v2: API 문항 순서와 multipleSelection 정책을 그대로 따라 답변을 저장한다. */}
            {questionsQuery.isLoading ? (
              <OnboardingState title="질문을 준비하는 중" description="별친구가 루틴 질문을 정리하고 있어요." />
            ) : null}

            {questionsQuery.isError ? (
              <ErrorState
                className="onboarding-flow__state"
                title="질문을 못 불러왔어요"
                description={getUserFacingErrorMessage(questionsQuery.error)}
                imageSrc={emptyStateAssets.mission}
                onAction={() => void questionsQuery.refetch()}
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
                    name={createdCharacter.name}
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
                          onClick={() => {
                            setAnswer(
                              currentQuestion.key,
                              getNextAnswerValue(currentQuestion, selectedValue, option.value),
                            );
                          }}
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
                    ? "완료하고 홈으로"
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
