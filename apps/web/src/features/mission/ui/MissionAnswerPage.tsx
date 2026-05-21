import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toCharacterKey } from "@/entities/character/types";
import { useHomeQuery } from "@/features/home/api/homeApi";
import {
  useCurrentMissionQuery,
  useStartMissionCompletionSessionMutation,
  useSubmitMissionCompletionAnswerMutation,
} from "@/features/mission/api/missionApi";
import { useMissionFlowStore } from "@/features/mission/model/missionFlowStore";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { AppShell, Button, Card, CharacterStage, Header, useToast } from "@/shared/ui";

import "./MissionAnswerPage.css";

export function MissionAnswerPage() {
  const [answer, setAnswer] = useState("");
  const startedRef = useRef(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const homeQuery = useHomeQuery();
  const currentMissionQuery = useCurrentMissionQuery();
  const startSessionMutation = useStartMissionCompletionSessionMutation();
  const submitAnswerMutation = useSubmitMissionCompletionAnswerMutation();
  const {
    activeMission,
    character,
    completionQuestion,
    setActiveMission,
    setCompletionQuestion,
    setCompletionResult,
  } = useMissionFlowStore();

  const currentMission = activeMission ?? currentMissionQuery.data ?? null;
  const currentCharacter = useMemo(() => {
    if (homeQuery.data?.character) {
      return {
        id: homeQuery.data.character.id,
        key: toCharacterKey(homeQuery.data.character.characterTypeCode),
        name: homeQuery.data.character.name,
      };
    }

    return character;
  }, [character, homeQuery.data?.character]);

  useEffect(() => {
    if (!currentMission || !currentCharacter || completionQuestion || startedRef.current) {
      return;
    }

    startedRef.current = true;
    setActiveMission(currentMission, currentCharacter);

    startSessionMutation.mutate(currentMission.id, {
      onSuccess: setCompletionQuestion,
      onError: (error) => {
        showToast(getUserFacingErrorMessage(error));
      },
    });
  }, [
    currentCharacter,
    currentMission,
    completionQuestion,
    setActiveMission,
    setCompletionQuestion,
    showToast,
    startSessionMutation,
  ]);

  const maxLength = completionQuestion?.question.maxLength ?? 300;
  const trimmedAnswer = answer.trim();
  const canSubmit =
    Boolean(completionQuestion) && trimmedAnswer.length >= 1 && trimmedAnswer.length <= maxLength;

  const handleSubmit = () => {
    if (!currentMission || !canSubmit) {
      return;
    }

    submitAnswerMutation.mutate(
      { missionId: currentMission.id, answer: trimmedAnswer },
      {
        onSuccess: (result) => {
          setCompletionResult(result);
          navigate(routes.missionResult);
        },
        onError: (error) => {
          showToast(getUserFacingErrorMessage(error));
        },
      },
    );
  };

  if ((homeQuery.isLoading || currentMissionQuery.isLoading) && !activeMission) {
    return (
      <MissionAnswerFrame onBack={() => navigate(routes.home)}>
        <div className="mission-answer__state">
          <div className="mission-answer__loading" />
          <p>별친구가 질문을 고르고 있어요.</p>
        </div>
      </MissionAnswerFrame>
    );
  }

  if (!currentMission || !currentCharacter) {
    return (
      <MissionAnswerFrame onBack={() => navigate(routes.home)}>
        <Card className="mission-answer__state">
          <h2>답변할 미션이 없어요.</h2>
          <p>홈에서 현재 제안된 미션을 먼저 확인해 주세요.</p>
          <Button onClick={() => navigate(routes.home)}>홈으로</Button>
        </Card>
      </MissionAnswerFrame>
    );
  }

  return (
    <MissionAnswerFrame onBack={() => navigate(routes.home)}>
      <div className="mission-answer__body">
        {/* SCR-009 완료 질문: 완료 버튼 직후 보상 지급 전, 질문 1개와 1~300자 답변만 받는다. */}
        <CharacterStage
          character={currentCharacter.key}
          mood="happy"
          name={currentCharacter.name}
          bubble={completionQuestion?.question.text ?? "방금 한 일을 짧게 남겨볼까요?"}
        />

        <Card className="mission-answer__mission">
          <span>완료한 미션</span>
          <strong>{currentMission.title}</strong>
          <p>{currentMission.description}</p>
        </Card>

        <label className="mission-answer__field">
          <span>실천 후기 남기기</span>
          <textarea
            value={answer}
            maxLength={maxLength}
            placeholder="한두 줄이면 충분해요 :)"
            onChange={(event) => setAnswer(event.target.value)}
          />
          <small className={!canSubmit && answer.length ? "mission-answer__hint--error" : ""}>
            {answer.length} / {maxLength}자
          </small>
        </label>

        <Button
          disabled={!canSubmit || startSessionMutation.isPending || submitAnswerMutation.isPending}
          onClick={handleSubmit}
        >
          {submitAnswerMutation.isPending ? "답변 남기는 중..." : "답변 완료"}
        </Button>
      </div>
    </MissionAnswerFrame>
  );
}

function MissionAnswerFrame({
  children,
  onBack,
}: {
  children: ReactNode;
  onBack: () => void;
}) {
  return (
    <main className="app-page mission-answer">
      <AppShell>
        <Header title="미션 인증하기" onBack={onBack} />
        {children}
      </AppShell>
    </main>
  );
}
