/**
 * 앱의 홈 화면입니다.
 * 사용자/지갑/캐릭터/오늘의 집중 미션을 모아 보여주고,
 * 미션 거절, 완료 시작, 출석, 공유 같은 핵심 진입점을 연결합니다.
 */
import { Bell, CalendarDays, Share2 } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useActiveCharacterQuery } from "@/features/character/api/characterCareApi";
import { resolveCharacterImageUrl } from "@/features/character/model/characterAssetResolver";
import { useHomeQuery } from "@/features/home/api/homeApi";
import { mapHomeResponseToViewModel } from "@/features/home/model/homeMappers";
import {
  getMissionLimitMessage,
  useRejectAndRequestNextMissionMutation,
  useStartMissionCompletionSessionMutation,
  useTodayFocusMissionQuery,
} from "@/features/mission/api/missionApi";
import { mapCurrentMissionToHomeMission } from "@/features/mission/model/missionMappers";
import { useMissionFlowStore } from "@/features/mission/model/missionFlowStore";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage, isPolarisApiError } from "@/shared/api";
import { brandAssets, currencyAssets, emptyStateAssets } from "@/shared/assets/polarisAssets";
import {
  AppShell,
  Button,
  Card,
  CharacterStage,
  ErrorState,
  Header,
  IconButton,
  MissionCard,
  StarPieceAmount,
  Tag,
  useToast,
} from "@/shared/ui";

import "./HomePage.css";

export function HomePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const homeQuery = useHomeQuery();
  const activeCharacterQuery = useActiveCharacterQuery();
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
  const characterImageUrl = useMemo(() => {
    if (!home) {
      return undefined;
    }

    return resolveCharacterImageUrl({
      character: home.character.key,
      mood: home.character.mood,
      states: homeQuery.data?.character?.states,
      equippedSkin: activeCharacterQuery.data?.equippedSkin ?? null,
      assetUrls: activeCharacterQuery.data?.assetUrls,
      fallbackUrl: homeQuery.data?.character?.currentAssetUrl,
    });
  }, [
    activeCharacterQuery.data?.assetUrls,
    activeCharacterQuery.data?.equippedSkin,
    home,
    homeQuery.data?.character?.currentAssetUrl,
    homeQuery.data?.character?.states,
  ]);

  if (homeQuery.isLoading) {
    return <HomeLoadingPage />;
  }

  if (homeQuery.isError) {
    return (
      <HomeFrame>
        <ErrorState
          className="home-page__state"
          description={getUserFacingErrorMessage(homeQuery.error)}
          imageSrc={emptyStateAssets.mission}
          onAction={() => void homeQuery.refetch()}
          title="홈을 불러오지 못했어요."
        />
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

  /** 현재 제안된 미션을 거절하고 백엔드에서 다음 미션을 이어서 요청합니다. */
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
          const limitMessage = isPolarisApiError(error)
            ? getMissionLimitMessage(error.apiError.code)
            : null;

          showToast(limitMessage ?? getUserFacingErrorMessage(error));
        },
      },
    );
  };

  /** 미션 완료 인증을 시작하기 전에 질문 세션을 열고 임시 미션 흐름 상태를 저장합니다. */
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
    <HomeFrame unreadNotificationCount={home.unreadNotificationCount} starPieceCount={home.walletStarPiece}>
      <div className="home-page__body">
        {/* SCR-006 캐릭터 영역: 홈 API의 캐릭터 상태와 현재 미션 대사를 함께 보여준다. */}
        <div className="home-page__stage-wrap">
          <CharacterStage
            character={home.character.key}
            mood={home.character.mood}
            imageUrl={characterImageUrl}
            name={home.character.name}
            bubble={focusMission?.characterMessage ?? home.character.bubble}
            ariaLabel="별친구 돌봄 화면 열기"
            onClick={() => navigate(routes.character)}
          />
          <div className="home-page__status-chips" aria-label="캐릭터 상태 요약">
            {home.character.gauges.map((gauge) => (
              <span
                className={`home-page__status-chip home-page__status-chip--${gauge.tone}`}
                key={gauge.key}
              >
                {gauge.label} {gauge.value}%
              </span>
            ))}
          </div>
        </div>

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
            <ErrorState
              className="home-page__state"
              description={getUserFacingErrorMessage(focusMissionQuery.error)}
              imageSrc={emptyStateAssets.mission}
              onAction={() => void focusMissionQuery.refetch()}
              title="미션을 불러오지 못했어요."
            />
          ) : mission ? (
            <div className="home-page__mission-box">
              <div className="home-page__mission-meta">
                <Tag>{mission.difficultyLabel}</Tag>
                <span className="home-page__mission-reward" aria-label={`보상 별조각 ${mission.rewardStarPiece}개`}>
                  보상
                  <StarPieceAmount amount={mission.rewardStarPiece} prefix="+" size="sm" tone="accent" />
                </span>
              </div>
              <MissionCard
                title={mission.title}
                description={mission.description}
                category={mission.category}
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
              <img
                alt=""
                className="home-page__empty-illustration"
                src={emptyStateAssets.mission}
              />
              <h2>오늘 미션은 여기까지예요.</h2>
              <p>내일 또 새 미션을 들고 올게요.</p>
            </Card>
          )}
        </section>

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
      </div>
    </HomeFrame>
  );
}

/** 홈 상단 로고, 지갑 버튼, 알림 버튼, 하단 탭을 공통으로 감싸는 화면 프레임입니다. */
function HomeFrame({
  children,
  unreadNotificationCount,
  starPieceCount,
}: {
  children: React.ReactNode;
  unreadNotificationCount?: number;
  starPieceCount?: number;
}) {
  const navigate = useNavigate();

  return (
    <main className="app-page home-page">
      <AppShell>
        <Header
          title={<img alt="Polaris" className="home-page__brand-logo" src={brandAssets.logoWordmark} />}
          left={
            typeof starPieceCount === "number" ? (
              <button
                className="home-page__wallet-button"
                onClick={() => navigate(routes.wallet)}
                aria-label="별조각 내역"
                type="button"
              >
                <StarPieceAmount amount={starPieceCount} size="sm" />
              </button>
            ) : (
              <IconButton aria-label="별조각 내역" onClick={() => navigate(routes.wallet)}>
                <img alt="" className="home-page__wallet-icon" src={currencyAssets.starPiece} />
              </IconButton>
            )
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

/** 홈 데이터가 아직 도착하지 않았을 때 UI kit 톤에 맞춘 skeleton을 보여줍니다. */
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
