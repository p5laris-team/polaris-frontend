/**
 * 오늘의 미션 기록 화면입니다.
 * 하루 동안 제안된 미션 스택을 상태별로 필터링해서 보여주고,
 * 아직 진행 가능한 현재 미션은 인증 화면으로 다시 이어 줍니다.
 */
import { type ReactNode, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  ListChecks,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toCharacterKey } from "@/entities/character/types";
import { type CurrentMissionResponse, type MissionStatus, type TodayMissionItem } from "@/entities/mission/types";
import { useHomeQuery } from "@/features/home/api/homeApi";
import {
  useCurrentMissionQuery,
  useStartMissionCompletionSessionMutation,
  useTodayMissionsQuery,
} from "@/features/mission/api/missionApi";
import { useMissionFlowStore } from "@/features/mission/model/missionFlowStore";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { emptyStateAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, Card, Header, StarPieceAmount, Tag, useToast } from "@/shared/ui";

import "./MissionHistoryPage.css";

type MissionHistoryFilter = "all" | "active" | "completed" | "rejected";

// 화면 필터 값과 버튼 라벨을 한 곳에 묶어 필터 추가 시 UI 반복문만 따라가게 합니다.
const filterLabels: Record<MissionHistoryFilter, string> = {
  all: "전체",
  active: "진행 중",
  completed: "완료",
  rejected: "거절",
};

export function MissionHistoryPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<MissionHistoryFilter>("all");
  const homeQuery = useHomeQuery();
  const currentMissionQuery = useCurrentMissionQuery();
  const todayMissionsQuery = useTodayMissionsQuery();
  const startSessionMutation = useStartMissionCompletionSessionMutation();
  const setActiveMission = useMissionFlowStore((state) => state.setActiveMission);
  const setCompletionQuestion = useMissionFlowStore((state) => state.setCompletionQuestion);
  const todayMissions = todayMissionsQuery.data;
  const filteredMissions = useMemo(() => {
    const missions = todayMissions?.missions ?? [];

    if (filter === "active") {
      return missions.filter((mission) => mission.status === "OFFERED" || mission.status === "ANSWERING");
    }

    if (filter === "completed") {
      return missions.filter((mission) => mission.status === "COMPLETED");
    }

    if (filter === "rejected") {
      return missions.filter((mission) => mission.status === "REJECTED");
    }

    return missions;
  }, [filter, todayMissions?.missions]);

  if (todayMissionsQuery.isLoading) {
    return <MissionHistoryLoadingPage />;
  }

  if (todayMissionsQuery.isError || !todayMissions) {
    return (
      <MissionHistoryFrame>
        <div className="mission-history__state">
          <h2>미션 기록을 불러오지 못했어요.</h2>
          <p>{getUserFacingErrorMessage(todayMissionsQuery.error)}</p>
          <Button onClick={() => void todayMissionsQuery.refetch()}>다시 불러오기</Button>
        </div>
      </MissionHistoryFrame>
    );
  }

  const currentMission = todayMissions.missions.find(
    (mission) => mission.id === todayMissions.currentMissionId,
  );
  const fullCurrentMission = currentMissionQuery.data ?? null;
  const currentMissionResponse =
    fullCurrentMission?.id === currentMission?.id
      ? fullCurrentMission
      : currentMission
        ? mapTodayMissionToCurrentMission(todayMissions.missionDate, currentMission)
        : null;
  const progressPercent = Math.min(
    100,
    Math.round((todayMissions.offeredCount / todayMissions.maxDailyOffers) * 100),
  );

  const handleStartMission = (mission: CurrentMissionResponse) => {
    const character = homeQuery.data?.character;

    if (character) {
      setActiveMission(mission, {
        id: character.id,
        key: toCharacterKey(character.characterTypeCode),
        name: character.name,
      });
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

  return (
    <MissionHistoryFrame>
      <div className="mission-history__body">
        <Card className="mission-history__summary-card">
          <div className="mission-history__summary-icon" aria-hidden="true">
            <ListChecks size={28} strokeWidth={1.8} />
          </div>
          <div className="mission-history__summary-copy">
            <span className="mission-history__eyebrow">{formatMissionDate(todayMissions.missionDate)}</span>
            <h1>오늘의 미션 기록</h1>
            <p>{todayMissions.offeredCount}개의 작은 시도 중 {todayMissions.completedCount}개가 별조각이 됐어요.</p>
          </div>
          <div className="mission-history__progress" aria-label="오늘 미션 제안 진행률">
            <span>
              {todayMissions.offeredCount}/{todayMissions.maxDailyOffers}
            </span>
            <div>
              <i style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </Card>

        <div className="mission-history__stat-grid">
          <StatCard icon={<CheckCircle2 size={19} strokeWidth={1.8} />} label="완료" value={`${todayMissions.completedCount}개`} />
          <StatCard icon={<XCircle size={19} strokeWidth={1.8} />} label="거절" value={`${todayMissions.rejectedCount}개`} />
          <StatCard icon={<Sparkles size={19} strokeWidth={1.8} />} label="남은 제안" value={`${todayMissions.remainingOfferCount}개`} />
        </div>

        {currentMission && currentMissionResponse ? (
          <button
            className="mission-history__current-card"
            disabled={startSessionMutation.isPending}
            onClick={() => handleStartMission(currentMissionResponse)}
            type="button"
          >
            <span className="mission-history__current-icon" aria-hidden="true">
              <Target size={20} strokeWidth={1.8} />
            </span>
            <span className="mission-history__current-copy">
              <small>{currentMission.status === "ANSWERING" ? "답변을 이어갈 수 있어요" : "지금 바로 수행할 수 있어요"}</small>
              <strong>{currentMission.title}</strong>
              <span>
                <Tag variant="accent">{getDifficultyLabel(currentMission.difficulty)}</Tag>
                <StarPieceAmount
                  amount={currentMission.rewardStarPiece}
                  prefix="+"
                  size="xs"
                  tone="accent"
                />
              </span>
            </span>
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
        ) : null}

        <div className="mission-history__filter" aria-label="미션 기록 필터">
          {(Object.keys(filterLabels) as MissionHistoryFilter[]).map((filterKey) => (
            <button
              aria-pressed={filter === filterKey}
              className={filter === filterKey ? "mission-history__filter-button--active" : ""}
              key={filterKey}
              onClick={() => setFilter(filterKey)}
              type="button"
            >
              {filterLabels[filterKey]}
            </button>
          ))}
        </div>

        {/* SCR-011 today API는 하루 최대 20개만 내려주므로 페이지네이션 없이 전체 스택을 한 번에 렌더링한다. */}
        {filteredMissions.length > 0 ? (
          <ol className="mission-history__list" aria-label="오늘 미션 스택">
            {filteredMissions.map((mission) => (
              <MissionHistoryItem
                current={mission.id === todayMissions.currentMissionId}
                disabled={startSessionMutation.isPending}
                key={mission.id}
                mission={mission}
                onClick={() => handleStartMission(mapTodayMissionToCurrentMission(todayMissions.missionDate, mission))}
              />
            ))}
          </ol>
        ) : (
          <Card className="mission-history__empty-card">
            <img
              alt=""
              className="mission-history__empty-illustration"
              src={emptyStateAssets.mission}
            />
            <strong>아직 조건에 맞는 미션이 없어요.</strong>
            <p>홈에서 오늘의 작은 미션을 하나씩 만나봐요.</p>
            <Button onClick={() => navigate(routes.home)} size="compact" variant="secondary">
              홈으로
            </Button>
          </Card>
        )}
      </div>
    </MissionHistoryFrame>
  );
}

/** 미션 기록 리스트의 단일 행입니다. 현재 미션만 버튼처럼 동작하고 과거 기록은 읽기 전용으로 둡니다. */
function MissionHistoryItem({
  current,
  disabled,
  mission,
  onClick,
}: {
  current: boolean;
  disabled: boolean;
  mission: TodayMissionItem;
  onClick: () => void;
}) {
  const meta = getMissionStatusMeta(mission.status);
  const interactive = current && (mission.status === "OFFERED" || mission.status === "ANSWERING");

  return (
    <li>
      <button
        className={[
          "mission-history__item",
          current ? "mission-history__item--current" : "",
          !interactive ? "mission-history__item--static" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={!interactive || disabled}
        onClick={onClick}
        type="button"
      >
        <span className="mission-history__order">{mission.stackOrder}</span>
        <span className="mission-history__item-copy">
          <span className="mission-history__item-head">
            <strong>{mission.title}</strong>
            <Tag variant={meta.tagVariant}>{meta.label}</Tag>
          </span>
          <span className="mission-history__item-message">{mission.characterMessage}</span>
          <span className="mission-history__item-meta">
            <span>{getDifficultyLabel(mission.difficulty)}</span>
            <StarPieceAmount amount={mission.rewardStarPiece} prefix="+" size="xs" tone="accent" />
            <span>{getMissionTimeLabel(mission)}</span>
          </span>
        </span>
        <span className={`mission-history__status-icon mission-history__status-icon--${meta.tone}`}>
          {interactive ? <ChevronRight size={18} strokeWidth={1.8} /> : meta.icon}
        </span>
      </button>
    </li>
  );
}

/** today API의 간략 미션을 인증 화면에서 쓰는 현재 미션 모양으로 맞춥니다. */
function mapTodayMissionToCurrentMission(
  missionDate: string,
  mission: TodayMissionItem,
): CurrentMissionResponse {
  return {
    id: mission.id,
    missionDate,
    stackOrder: mission.stackOrder,
    title: mission.title,
    // 히스토리 API에는 상세 설명이 없어서 인증 화면 진입 시 말풍선 메시지를 임시 설명으로 사용한다.
    description: mission.characterMessage,
    characterMessage: mission.characterMessage,
    category: mission.category,
    difficulty: mission.difficulty,
    rewardStarPiece: mission.rewardStarPiece,
    status: mission.status,
  };
}

/** 미션 기록 화면에서 공통으로 쓰는 헤더, 하단 탭, shell 레이아웃입니다. */
function MissionHistoryFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <main className="mission-history">
      <AppShell>
        <Header title="미션 기록" onBack={() => navigate(routes.home)} />
        {children}
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}

/** 미션 기록 데이터를 불러오는 동안 보여주는 skeleton 화면입니다. */
function MissionHistoryLoadingPage() {
  return (
    <MissionHistoryFrame>
      <div className="mission-history__body">
        <div className="mission-history__skeleton mission-history__skeleton--summary" />
        <div className="mission-history__skeleton mission-history__skeleton--item" />
        <div className="mission-history__skeleton mission-history__skeleton--item" />
        <div className="mission-history__skeleton mission-history__skeleton--item" />
      </div>
    </MissionHistoryFrame>
  );
}

/** 완료/거절/남은 제안처럼 작은 통계를 카드로 보여주는 보조 컴포넌트입니다. */
function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="mission-history__stat-card">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </Card>
  );
}

/** 백엔드 미션 상태값을 사람이 읽는 라벨, 아이콘, 색상 톤으로 변환합니다. */
function getMissionStatusMeta(status: MissionStatus): {
  icon: ReactNode;
  label: string;
  tagVariant: "primary" | "accent" | "neutral";
  tone: string;
} {
  if (status === "COMPLETED") {
    return {
      icon: <CheckCircle2 size={20} strokeWidth={1.8} />,
      label: "완료",
      tagVariant: "primary",
      tone: "completed",
    };
  }

  if (status === "REJECTED") {
    return {
      icon: <XCircle size={20} strokeWidth={1.8} />,
      label: "거절",
      tagVariant: "neutral",
      tone: "rejected",
    };
  }

  if (status === "ANSWERING") {
    return {
      icon: <Clock3 size={20} strokeWidth={1.8} />,
      label: "답변 중",
      tagVariant: "accent",
      tone: "answering",
    };
  }

  if (status === "OFFERED") {
    return {
      icon: <Target size={20} strokeWidth={1.8} />,
      label: "제안됨",
      tagVariant: "accent",
      tone: "offered",
    };
  }

  return {
    icon: <RotateCcw size={20} strokeWidth={1.8} />,
    label: "대기",
    tagVariant: "neutral",
    tone: "pending",
  };
}

/** API 난이도 enum을 화면에 보이는 한국어 라벨로 바꿉니다. */
function getDifficultyLabel(difficulty: TodayMissionItem["difficulty"]) {
  if (difficulty === "EASY") return "쉬움";
  if (difficulty === "NORMAL") return "보통";
  return "도전";
}

/** 완료/거절 시간이 있으면 해당 시간을, 없으면 생성 시간을 기록 라벨로 보여줍니다. */
function getMissionTimeLabel(mission: TodayMissionItem) {
  if (mission.completedAt) return `완료 ${formatTime(mission.completedAt)}`;
  if (mission.rejectedAt) return `거절 ${formatTime(mission.rejectedAt)}`;

  return `생성 ${formatTime(mission.createdAt)}`;
}

/** ISO 날짜 문자열을 한국어 시각 표시로 변환합니다. */
function formatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

/** yyyy-MM-dd 날짜를 한국어 월/일/요일 라벨로 변환합니다. */
function formatMissionDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${value}T00:00:00+09:00`));
}
