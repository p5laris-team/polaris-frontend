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
  type OnboardingQuestionKey,
  type SaveOnboardingProfileRequest,
} from "@/features/onboarding/model/onboardingTypes";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { AppShell, Button, CharacterStage, Header, useToast } from "@/shared/ui";

import "./OnboardingFlow.css";

const REQUIRED_ONBOARDING_KEYS: OnboardingQuestionKey[] = [
  "livingType",
  "wakeUpTime",
  "sleepTime",
  "preferredMissionTime",
  "routineGoal",
  "activityPreference",
  "missionIntensity",
];

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
    () => questions.filter((question) => Boolean(answers[question.key])).length,
    [answers, questions],
  );
  const progress = total ? ((currentIndex + 1) / total) * 100 : 0;

  /** 현재 문항 답변을 확인하고, 마지막 문항에서는 온보딩 프로필 저장까지 수행합니다. */
  const handleNext = async () => {
    if (!currentQuestion) return;

    if (!selectedValue) {
      showToast("현재 문항의 답을 먼저 골라 주세요.");
      return;
    }

    if (currentIndex < total - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    const request = buildSaveRequest(questions, answers);

    if (!request) {
      const firstMissingIndex = questions.findIndex((question) => !answers[question.key]);
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
            {/* SCR-005 온보딩 7문항: API 명세의 questions 응답 순서대로 단일 선택 답변을 저장한다. */}
            {questionsQuery.isLoading ? (
              <OnboardingState title="질문을 준비하는 중" description="별친구가 루틴 질문을 정리하고 있어요." />
            ) : null}

            {questionsQuery.isError ? (
              <OnboardingState
                title="질문을 못 불러왔어요"
                description={getUserFacingErrorMessage(questionsQuery.error)}
                action={<Button onClick={() => void questionsQuery.refetch()}>다시 불러오기</Button>}
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
                    mood={selectedValue ? "happy" : "idle"}
                    name={createdCharacter.name}
                  />
                </div>

                <article className="onboarding-survey__question">
                  <h2>{currentQuestion.question}</h2>
                  <div className="onboarding-survey__options">
                    {currentQuestion.options.map((option) => {
                      const selected = selectedValue === option.value;

                      return (
                        <button
                          aria-pressed={selected}
                          className={`onboarding-survey__option ${
                            selected ? "onboarding-survey__option--selected" : ""
                          }`.trim()}
                          key={option.value}
                          onClick={() => setAnswer(currentQuestion.key, option.value)}
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
              <Button disabled={!selectedValue || saveProfileMutation.isPending} onClick={handleNext}>
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

/** 화면 답변 객체를 백엔드가 요구하는 7개 필드와 원본 answers record로 변환합니다. */
function buildSaveRequest(
  questions: OnboardingQuestion[],
  answers: OnboardingAnswers,
): SaveOnboardingProfileRequest | null {
  // API 명세는 7개 필드를 납작하게 받으므로, 화면 답변 객체에서 누락 여부를 먼저 확인한다.
  const missingKey = REQUIRED_ONBOARDING_KEYS.find((key) => !answers[key]);

  if (missingKey) {
    return null;
  }

  const answerRecord = Object.fromEntries(
    questions.map((question) => [question.key, answers[question.key] ?? ""]),
  );

  return {
    livingType: answers.livingType ?? "",
    wakeUpTime: answers.wakeUpTime ?? "",
    sleepTime: answers.sleepTime ?? "",
    preferredMissionTime: answers.preferredMissionTime ?? "",
    routineGoal: answers.routineGoal ?? "",
    activityPreference: answers.activityPreference ?? "",
    missionIntensity: answers.missionIntensity ?? "",
    answers: answerRecord,
    completed: true,
  };
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
