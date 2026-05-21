import { Bell, CalendarDays, Gem, Share2 } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useHomeQuery } from "@/features/home/api/homeApi";
import { mapHomeResponseToViewModel } from "@/features/home/model/homeMappers";
import {
  useRejectAndRequestNextMissionMutation,
  useStartMissionCompletionSessionMutation,
  useTodayFocusMissionQuery,
} from "@/features/mission/api/missionApi";
import { mapCurrentMissionToHomeMission } from "@/features/mission/model/missionMappers";
import { useMissionFlowStore } from "@/features/mission/model/missionFlowStore";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import {
  AppShell,
  Button,
  Card,
  CharacterStage,
  Header,
  IconButton,
  MissionCard,
  StatusGauge,
  Tag,
  useToast,
} from "@/shared/ui";

import "./HomePage.css";

export function HomePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const homeQuery = useHomeQuery();
  const rejectAndNextMutation = useRejectAndRequestNextMissionMutation();
  const startCompletionSessionMutation = useStartMissionCompletionSessionMutation();
  const { setActiveMission, setCompletionQuestion } = useMissionFlowStore();
  const home = useMemo(
    () => (homeQuery.data ? mapHomeResponseToViewModel(homeQuery.data) : null),
    [homeQuery.data],
  );
  const focusMissionQuery = useTodayFocusMissionQuery(home?.character.id);
  const focusMission = focusMissionQuery.data ?? null;
  const mission = useMemo(
    () => mapCurrentMissionToHomeMission(focusMission),
    [focusMission],
  );

  if (homeQuery.isLoading) {
    return <HomeLoadingPage />;
  }

  if (homeQuery.isError) {
    return (
      <HomeFrame>
        <div className="home-page__state">
          <h2>홈을 불러오지 못했어요.</h2>
          <p>{getUserFacingErrorMessage(homeQuery.error)}</p>
          <Button onClick={() => void homeQuery.refetch()}>다시 불러오기</Button>
        </div>
      </HomeFrame>
    );
  }

  if (!home) {
    return (
      <HomeFrame>
        <div className="home-page__state">
          <h2>아직 홈 데이터가 없어요.</h2>
          <p>잠시 후 다시 별친구를 불러와 볼게요.</p>
        </div>
      </HomeFrame>
    );
  }

  const handleRejectMission = () => {
    if (!mission) {
      return;
    }

    rejectAndNextMutation.mutate(
      {
        missionId: mission.id,
        characterId: home.character.id,
      },
      {
        onSuccess: ({ rejection }) => {
          showToast(rejection.characterMessage);
        },
        onError: (error) => {
          showToast(getUserFacingErrorMessage(error));
        },
      },
    );
  };

  const handleStartCompletion = () => {
    if (!mission || !focusMission) {
      return;
    }

    setActiveMission(focusMission, {
      id: home.character.id,
      key: home.character.key,
      name: home.character.name,
    });

    startCompletionSessionMutation.mutate(mission.id, {
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
    <HomeFrame unreadNotificationCount={home.unreadNotificationCount}>
      <div className="home-page__body">
        {/* SCR-006 캐릭터 영역: 홈 API의 캐릭터 상태와 현재 미션 대사를 함께 보여준다. */}
        <CharacterStage
          character={home.character.key}
          mood={home.character.mood}
          name={home.character.name}
          bubble={focusMission?.characterMessage ?? home.character.bubble}
          ariaLabel="별친구 돌봄 화면 열기"
          onClick={() => navigate(routes.character)}
        />

        <div className="home-page__quick-row">
          <button
            className="home-page__quick-card"
            type="button"
            onClick={() => navigate(routes.attendance)}
          >
            <CalendarDays size={20} strokeWidth={1.75} />
            <span>
              <strong>출석 체크</strong>
              <small>오늘의 도장 콕 찍기</small>
            </span>
          </button>
          <button
            className="home-page__quick-card"
            type="button"
            onClick={() => navigate(routes.share)}
          >
            <Share2 size={20} strokeWidth={1.75} />
            <span>
              <strong>카드 공유</strong>
              <small>별조각 보상 받기</small>
            </span>
          </button>
        </div>

        <Card className="home-page__gauges">
          {home.character.gauges.map((gauge) => (
            <StatusGauge
              key={gauge.key}
              label={`${gauge.label} · ${gauge.description}`}
              value={gauge.value}
              tone={gauge.tone}
            />
          ))}
        </Card>

        {/* SCR-007 미션 카드: 완료는 질문 세션으로, 거절은 즉시 거절 후 다음 미션 요청으로 이어진다. */}
        <section className="home-page__mission-section" aria-label="제안된 미션">
          <div className="home-page__section-title">
            <h2>제안된 미션</h2>
            {mission ? <span>{mission.stackLabel}</span> : null}
          </div>

          {focusMissionQuery.isLoading ? (
            <Card className="home-page__state">
              <h2>오늘의 작은 별을 찾는 중이에요.</h2>
              <p>별친구가 지금 해볼 만한 미션을 고르고 있어요.</p>
            </Card>
          ) : focusMissionQuery.isError ? (
            <Card className="home-page__state">
              <h2>미션을 불러오지 못했어요.</h2>
              <p>{getUserFacingErrorMessage(focusMissionQuery.error)}</p>
              <Button onClick={() => void focusMissionQuery.refetch()}>다시 불러오기</Button>
            </Card>
          ) : mission ? (
            <div className="home-page__mission-box">
              <div className="home-page__mission-meta">
                <Tag>{mission.difficultyLabel}</Tag>
                <strong>+{mission.rewardStarPiece}✦</strong>
              </div>
              <MissionCard
                title={mission.title}
                description={mission.description}
                category={mission.category}
                rewardStarPiece={mission.rewardStarPiece}
                status="active"
              />
              <div className="home-page__mission-actions">
                <Button
                  variant="secondary"
                  disabled={rejectAndNextMutation.isPending || focusMissionQuery.isFetching}
                  onClick={handleRejectMission}
                >
                  {rejectAndNextMutation.isPending ? "찾는 중..." : "다른 거 볼게요"}
                </Button>
                <Button
                  disabled={startCompletionSessionMutation.isPending || focusMissionQuery.isFetching}
                  onClick={handleStartCompletion}
                >
                  {startCompletionSessionMutation.isPending ? "질문 여는 중..." : "해냈어요"}
                </Button>
              </div>
            </div>
          ) : (
            <Card className="home-page__state">
              <h2>오늘 미션은 여기까지예요.</h2>
              <p>내일 또 새 미션을 들고 올게요.</p>
            </Card>
          )}
        </section>
      </div>
    </HomeFrame>
  );
}

function HomeFrame({
  children,
  unreadNotificationCount,
}: {
  children: React.ReactNode;
  unreadNotificationCount?: number;
}) {
  const navigate = useNavigate();

  return (
    <main className="app-page home-page">
      <AppShell>
        <Header
          title="Polaris"
          left={
            <IconButton aria-label="별조각 내역" onClick={() => navigate(routes.wallet)}>
              <Gem size={22} strokeWidth={1.75} />
            </IconButton>
          }
          right={
            <IconButton aria-label="알림" onClick={() => navigate(routes.notifications)}>
              <Bell size={22} strokeWidth={1.75} />
              {unreadNotificationCount ? <span className="home-page__notification-dot" /> : null}
            </IconButton>
          }
        />
        {children}
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}

function HomeLoadingPage() {
  return (
    <HomeFrame>
      <div className="home-page__body">
        <div className="home-page__skeleton home-page__skeleton--stage" />
        <div className="home-page__skeleton" />
        <div className="home-page__skeleton home-page__skeleton--mission" />
      </div>
    </HomeFrame>
  );
}
