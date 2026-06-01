/**
 * 미션 상세 화면입니다.
 * 날짜별 기록에서 들어온 사용자가 미션 설명, 완료 질문, 답변 전문, 가벼운 피드백을 한 번에 확인합니다.
 */
import { type ReactNode, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Sparkles,
  Target,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { toCharacterKey } from "@/entities/character/types";
import {
  type MissionDetailResponse,
  type MissionFeedbackReaction,
  type MissionStatus,
} from "@/entities/mission/types";
import { useHomeQuery } from "@/features/home/api/homeApi";
import {
  useMissionDetailQuery,
  useStartMissionCompletionSessionMutation,
  useUpsertMissionFeedbackMutation,
} from "@/features/mission/api/missionApi";
import { useMissionFlowStore } from "@/features/mission/model/missionFlowStore";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { emptyStateAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, Card, ErrorState, Header, StarPieceAmount, Tag, useToast } from "@/shared/ui";

import "./MissionDetailPage.css";

type RejectionReason = {
  code: string;
  label: string;
};

const rejectionReasons: RejectionReason[] = [
  { code: "TOO_HARD", label: "조금 어려웠어요" },
  { code: "NOT_MY_CONTEXT", label: "상황이 안 맞았어요" },
  { code: "REPEATED", label: "비슷한 미션이었어요" },
];

export function MissionDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { showToast } = useToast();
  const missionId = Number(params.missionId);
  const missionDetailQuery = useMissionDetailQuery(Number.isFinite(missionId) ? missionId : undefined);
  const homeQuery = useHomeQuery();
  const startSessionMutation = useStartMissionCompletionSessionMutation();
  const feedbackMutation = useUpsertMissionFeedbackMutation();
  const setActiveMission = useMissionFlowStore((state) => state.setActiveMission);
  const setCompletionQuestion = useMissionFlowStore((state) => state.setCompletionQuestion);
  const [selectedReaction, setSelectedReaction] = useState<MissionFeedbackReaction | null>(null);
  const [completionFeedbackSubmitted, setCompletionFeedbackSubmitted] = useState(false);
  const [selectedReasonCode, setSelectedReasonCode] = useState<string | null>(null);

  if (missionDetailQuery.isLoading) {
    return (
      <MissionDetailFrame>
        <div className="mission-detail__body">
          <div className="mission-detail__skeleton mission-detail__skeleton--hero" />
          <div className="mission-detail__skeleton mission-detail__skeleton--card" />
          <div className="mission-detail__skeleton mission-detail__skeleton--card" />
        </div>
      </MissionDetailFrame>
    );
  }

  if (missionDetailQuery.isError || !missionDetailQuery.data) {
    return (
      <MissionDetailFrame>
        <ErrorState
          className="mission-detail__state"
          description={getUserFacingErrorMessage(missionDetailQuery.error)}
          imageSrc={emptyStateAssets.mission}
          onAction={() => void missionDetailQuery.refetch()}
          title="미션 상세를 불러오지 못했어요."
        />
      </MissionDetailFrame>
    );
  }

  const mission = missionDetailQuery.data;
  const statusMeta = getMissionStatusMeta(mission.status);
  const canStartMission = mission.status === "OFFERED" || mission.status === "ANSWERING";
  const hasSubmittedCompletionFeedback = completionFeedbackSubmitted || Boolean(mission.satisfactionFeedback);

  const handleStartMission = () => {
    const character = homeQuery.data?.character;

    if (character) {
      setActiveMission(
        {
          id: mission.id,
          missionDate: mission.missionDate,
          stackOrder: mission.stackOrder,
          title: mission.title,
          description: mission.description,
          characterMessage: mission.characterMessage,
          category: mission.category,
          difficulty: mission.difficulty,
          rewardStarPiece: mission.rewardStarPiece,
          status: mission.status,
        },
        {
          id: character.id,
          key: toCharacterKey(character.characterTypeCode),
          name: character.name,
        },
      );
    }

    startSessionMutation.mutate(mission.id, {
      onSuccess: (question) => {
        setCompletionQuestion(question);
        navigate(routes.missionAnswer);
      },
      onError: (error) => {
        showToast(getUserFacingErrorMessage(error));
      },
    });
  };

  const handleCompletionFeedback = (reaction: MissionFeedbackReaction) => {
    setSelectedReaction(reaction);
    feedbackMutation.mutate(
      {
        missionId: mission.id,
        body: {
          feedbackType: "SATISFACTION",
          reaction,
        },
      },
      {
        onSuccess: () => {
          setCompletionFeedbackSubmitted(true);
          showToast("미션 추천에 참고할게요.");
        },
        onError: (error) => {
          setSelectedReaction(null);
          showToast(getUserFacingErrorMessage(error));
        },
      },
    );
  };

  const handleRejectionFeedback = (reason: RejectionReason) => {
    setSelectedReasonCode(reason.code);
    feedbackMutation.mutate(
      {
        missionId: mission.id,
        body: {
          feedbackType: "REJECTION",
          reasonCode: reason.code,
          reasonText: reason.label,
        },
      },
      {
        onSuccess: () => showToast("다음 미션에 살짝 반영해볼게요."),
        onError: (error) => showToast(getUserFacingErrorMessage(error)),
      },
    );
  };

  return (
    <MissionDetailFrame>
      <div className="mission-detail__body">
        <Card className="mission-detail__hero-card">
          <span className={`mission-detail__status-icon mission-detail__status-icon--${statusMeta.tone}`}>
            {statusMeta.icon}
          </span>
          <div className="mission-detail__hero-copy">
            <div className="mission-detail__tag-row">
              <Tag variant={statusMeta.tagVariant}>{statusMeta.label}</Tag>
              <Tag variant="neutral">{getDifficultyLabel(mission.difficulty)}</Tag>
            </div>
            <h1>{mission.title}</h1>
            <p>{mission.description}</p>
            <div className="mission-detail__meta-row">
              <span>
                <CalendarDays size={15} strokeWidth={1.8} />
                {formatMissionDate(mission.missionDate)}
              </span>
              <StarPieceAmount amount={mission.rewardStarPiece} prefix="+" size="sm" tone="accent" />
            </div>
          </div>
        </Card>

        <Card className="mission-detail__message-card">
          <MessageCircle size={21} strokeWidth={1.8} />
          <div>
            <strong>별친구의 한마디</strong>
            <p>{mission.characterMessage}</p>
          </div>
        </Card>

        <DetailSection title="완료 질문">
          {mission.question ? (
            <p className="mission-detail__question">{mission.question.text}</p>
          ) : (
            <p className="mission-detail__muted">아직 완료 질문이 열리지 않았어요.</p>
          )}
        </DetailSection>

        <DetailSection title="내 답변">
          {mission.answer ? (
            <div className="mission-detail__answer">
              <p>{mission.answer.text}</p>
              <span>{formatDateTime(mission.answer.answeredAt)}</span>
            </div>
          ) : (
            <p className="mission-detail__muted">남겨진 답변이 아직 없어요.</p>
          )}
        </DetailSection>

        {mission.completionCharacterResponse ? (
          <Card className="mission-detail__message-card mission-detail__message-card--soft">
            <Sparkles size={21} strokeWidth={1.8} />
            <div>
              <strong>완료 반응</strong>
              <p>{mission.completionCharacterResponse}</p>
            </div>
          </Card>
        ) : null}

        {mission.status === "COMPLETED" && !hasSubmittedCompletionFeedback ? (
          <DetailSection title="이 미션 어땠나요?">
            <div className="mission-detail__feedback-row">
              <FeedbackButton
                active={selectedReaction === "LIKE"}
                disabled={feedbackMutation.isPending}
                icon={<ThumbsUp size={18} strokeWidth={1.9} />}
                label="좋았어요"
                onClick={() => handleCompletionFeedback("LIKE")}
              />
              <FeedbackButton
                active={selectedReaction === "DISLIKE"}
                disabled={feedbackMutation.isPending}
                icon={<ThumbsDown size={18} strokeWidth={1.9} />}
                label="아쉬웠어요"
                onClick={() => handleCompletionFeedback("DISLIKE")}
              />
            </div>
          </DetailSection>
        ) : null}

        {mission.status === "REJECTED" ? (
          <DetailSection title="다음 추천에 참고할까요?">
            <div className="mission-detail__reason-row">
              {rejectionReasons.map((reason) => (
                <button
                  className={
                    selectedReasonCode === reason.code
                      ? "mission-detail__reason-button mission-detail__reason-button--selected"
                      : "mission-detail__reason-button"
                  }
                  disabled={feedbackMutation.isPending}
                  key={reason.code}
                  onClick={() => handleRejectionFeedback(reason)}
                  type="button"
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </DetailSection>
        ) : null}

        <div className="mission-detail__actions">
          {canStartMission ? (
            <Button disabled={startSessionMutation.isPending} onClick={handleStartMission}>
              {mission.status === "ANSWERING" ? "답변 이어가기" : "미션 수행하기"}
            </Button>
          ) : (
            <Button onClick={() => navigate(routes.missions)} variant="secondary">
              기록으로 돌아가기
            </Button>
          )}
        </div>
      </div>
    </MissionDetailFrame>
  );
}

function MissionDetailFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <main className="mission-detail">
      <AppShell>
        <Header title="미션 상세" onBack={() => navigate(routes.missions)} />
        {children}
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}

function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Card className="mission-detail__section-card">
      <h2>{title}</h2>
      {children}
    </Card>
  );
}

function FeedbackButton({
  active,
  disabled,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={active ? "mission-detail__feedback-button mission-detail__feedback-button--active" : "mission-detail__feedback-button"}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function getMissionStatusMeta(status: MissionStatus): {
  icon: ReactNode;
  label: string;
  tagVariant: "primary" | "accent" | "neutral";
  tone: string;
} {
  if (status === "COMPLETED") {
    return {
      icon: <CheckCircle2 size={25} strokeWidth={1.8} />,
      label: "완료",
      tagVariant: "primary",
      tone: "completed",
    };
  }

  if (status === "REJECTED") {
    return {
      icon: <XCircle size={25} strokeWidth={1.8} />,
      label: "거절",
      tagVariant: "neutral",
      tone: "rejected",
    };
  }

  if (status === "ANSWERING") {
    return {
      icon: <Clock3 size={25} strokeWidth={1.8} />,
      label: "답변 중",
      tagVariant: "accent",
      tone: "answering",
    };
  }

  return {
    icon: <Target size={25} strokeWidth={1.8} />,
    label: status === "OFFERED" ? "제안됨" : "대기",
    tagVariant: "accent",
    tone: "offered",
  };
}

function getDifficultyLabel(difficulty: MissionDetailResponse["difficulty"]) {
  if (difficulty === "EASY") return "쉬움";
  if (difficulty === "NORMAL") return "보통";

  return "도전";
}

function formatMissionDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
