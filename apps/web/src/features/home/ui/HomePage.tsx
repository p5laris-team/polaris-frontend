/**
 * 앱의 홈 화면입니다.
 * 사용자/지갑/캐릭터/오늘의 집중 미션을 모아 보여주고,
 * 미션 거절, 완료 시작, 출석, 공유 같은 핵심 진입점을 연결합니다.
 */
import { Bell, CalendarDays, Share2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { type CharacterGrowth } from "@/entities/character/types";
import { useActiveCharacterQuery } from "@/features/character/api/characterCareApi";
import { useCharacterInteractionMutation } from "@/features/character/api/characterTalkApi";
import {
  resolveCharacterGrowthAssetLevel,
  resolveCharacterImageUrl,
} from "@/features/character/model/characterAssetResolver";
import {
  formatCharacterInteractionText,
  formatCharacterSpeech,
} from "@/features/character/model/characterToneText";
import { type CharacterInteractionResponse } from "@/features/character/model/characterTalkTypes";
import { CharacterTalkLaunchButton } from "@/features/character/ui/CharacterTalkLaunchButton";
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
import {
  brandAssets,
  currencyAssets,
  emptyStateAssets,
  growthAssets,
  memoryAssets,
  type CharacterKey,
  type GrowthStageKey,
} from "@/shared/assets/polarisAssets";
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
  const interactionMutation = useCharacterInteractionMutation();
  const rejectAndNextMutation = useRejectAndRequestNextMissionMutation();
  const startCompletionSessionMutation = useStartMissionCompletionSessionMutation();
  const { setActiveMission, setCompletionQuestion } = useMissionFlowStore();
  const [homeCharacterMessage, setHomeCharacterMessage] = useState<string | null>(null);
  const [homeMemoryInteraction, setHomeMemoryInteraction] = useState<CharacterInteractionResponse | null>(null);
  const [isHomeCharacterReacting, setIsHomeCharacterReacting] = useState(false);
  const homeReactionStartTimeoutRef = useRef<number | null>(null);
  const homeReactionTimeoutRef = useRef<number | null>(null);
  const homeMemoryTimeoutRef = useRef<number | null>(null);
  const homeTapCountRef = useRef(0);
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
  const characterGrowth =
    activeCharacterQuery.data?.growth ??
    home?.character.growth ??
    homeQuery.data?.character?.growth ??
    null;
  const characterImageUrl = useMemo(() => {
    if (!home) {
      return undefined;
    }

    return resolveCharacterImageUrl({
      character: home.character.key,
      mood: home.character.mood,
      states: homeQuery.data?.character?.states,
      growth: characterGrowth,
      equippedSkin: activeCharacterQuery.data?.equippedSkin ?? null,
      assetUrls: activeCharacterQuery.data?.assetUrls,
      fallbackUrl: homeQuery.data?.character?.currentAssetUrl,
    });
  }, [
    activeCharacterQuery.data?.assetUrls,
    activeCharacterQuery.data?.equippedSkin,
    characterGrowth,
    home,
    homeQuery.data?.character?.currentAssetUrl,
    homeQuery.data?.character?.states,
  ]);

  useEffect(() => {
    setHomeCharacterMessage(null);
    setHomeMemoryInteraction(null);
    homeTapCountRef.current = 0;
    if (homeMemoryTimeoutRef.current) {
      window.clearTimeout(homeMemoryTimeoutRef.current);
      homeMemoryTimeoutRef.current = null;
    }
  }, [focusMission?.id, home?.character.id]);

  useEffect(
    () => () => {
      if (homeReactionStartTimeoutRef.current) {
        window.clearTimeout(homeReactionStartTimeoutRef.current);
      }
      if (homeReactionTimeoutRef.current) {
        window.clearTimeout(homeReactionTimeoutRef.current);
      }
      if (homeMemoryTimeoutRef.current) {
        window.clearTimeout(homeMemoryTimeoutRef.current);
      }
    },
    [],
  );

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
          showToast(formatCharacterSpeech(home.character.key, rejection.characterMessage, home.character.name));
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

  /** 홈 캐릭터 터치는 상세 이동 대신 별친구 즉시 반응으로 처리합니다. */
  const handleHomeCharacterTap = () => {
    if (!home) {
      return;
    }

    homeTapCountRef.current += 1;
    setHomeCharacterMessage(pickHomeTapReaction(home.character.key, home.character.name));
    playHomeCharacterReaction();

    if (interactionMutation.isPending || !shouldRequestHomeMemoryPeek(homeTapCountRef.current)) {
      return;
    }

    interactionMutation.mutate(
      {
        characterId: home.character.id,
        body: {
          interactionType: "TAP",
        },
      },
      {
        onSuccess: (result) => {
          const nextMessage = formatCharacterInteractionText(result, home.character.name);
          if (result.memory) {
            setHomeCharacterMessage(nextMessage);
            showHomeMemoryPeek(result);
            showToast(result.memoryUnlocked ? `새 기억 조각: ${result.memory.title}` : `기억 조각: ${result.memory.title}`);
          }
        },
        onError: (error) => {
          showToast(getUserFacingErrorMessage(error));
        },
      },
    );
  };

  const showHomeMemoryPeek = (result: CharacterInteractionResponse) => {
    setHomeMemoryInteraction(result);

    if (homeMemoryTimeoutRef.current) {
      window.clearTimeout(homeMemoryTimeoutRef.current);
    }

    homeMemoryTimeoutRef.current = window.setTimeout(() => {
      setHomeMemoryInteraction(null);
      homeMemoryTimeoutRef.current = null;
    }, 5200);
  };

  const playHomeCharacterReaction = () => {
    if (homeReactionStartTimeoutRef.current) {
      window.clearTimeout(homeReactionStartTimeoutRef.current);
    }
    if (homeReactionTimeoutRef.current) {
      window.clearTimeout(homeReactionTimeoutRef.current);
    }

    setIsHomeCharacterReacting(false);
    homeReactionStartTimeoutRef.current = window.setTimeout(() => {
      setIsHomeCharacterReacting(true);
      homeReactionStartTimeoutRef.current = null;
      homeReactionTimeoutRef.current = window.setTimeout(() => {
        setIsHomeCharacterReacting(false);
        homeReactionTimeoutRef.current = null;
      }, 680);
    }, 20);
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
      growth: characterGrowth,
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
        <div
          className={[
            "home-page__stage-wrap",
            isHomeCharacterReacting ? "home-page__stage-wrap--reacting" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <CharacterStage
            character={home.character.key}
            mood={home.character.mood}
            imageUrl={characterImageUrl}
            growthLevel={resolveCharacterGrowthAssetLevel(characterGrowth)}
            name={formatHomeCharacterName(home.character.name, characterGrowth)}
            nameAccessory={
              characterGrowth ? (
                <img
                  alt={`${characterGrowth.growthStageLabel} 배지`}
                  src={growthAssets.badges[getGrowthStageKey(characterGrowth.growthStage)]}
                />
              ) : null
            }
            subLabel={formatShortExpLabel(characterGrowth)}
            bubble={
              homeCharacterMessage ??
              formatCharacterSpeech(
                home.character.key,
                focusMission?.characterMessage ?? home.character.bubble,
                home.character.name,
              )
            }
            ariaLabel="별친구 터치하기"
            onClick={handleHomeCharacterTap}
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
          <CharacterTalkLaunchButton
            characterKey={home.character.key}
            characterName={home.character.name}
            className="home-page__talk-launch"
            onClick={() => navigate(routes.characterTalk)}
          />
          {homeMemoryInteraction?.memory ? (
            <div
              className={[
                "home-page__memory-peek",
                homeMemoryInteraction.memoryUnlocked ? "home-page__memory-peek--new" : "home-page__memory-peek--echo",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-live="polite"
            >
              <img className="home-page__memory-peek-bg" src={memoryAssets.cardBg} alt="" />
              <img className="home-page__memory-peek-glow" src={memoryAssets.unlockedGlow} alt="" />
              <img
                className="home-page__memory-peek-fragment"
                src={getHomeMemoryFragmentAsset(homeMemoryInteraction.fragmentType)}
                alt=""
              />
              <span>
                <small>{homeMemoryInteraction.memoryUnlocked ? "새 기억 조각" : "기억 조각"}</small>
                <strong>{homeMemoryInteraction.memory.title}</strong>
              </span>
              {homeMemoryInteraction.memoryUnlocked ? (
                <img className="home-page__memory-peek-effect" src={memoryAssets.unlockEffect} alt="" />
              ) : null}
            </div>
          ) : null}
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
                onClick={() => navigate(routes.missions)}
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

function formatHomeCharacterName(name: string, growth: CharacterGrowth | null | undefined) {
  return growth ? `Lv.${growth.level} ${name}` : name;
}

function formatShortExpLabel(growth: CharacterGrowth | null | undefined) {
  if (!growth) {
    return null;
  }

  if (growth.maxLevel) {
    return "MAX";
  }

  const required = Math.max(0, growth.nextLevelExp - growth.currentLevelExp);
  const current = Math.max(0, Math.min(required, growth.exp - growth.currentLevelExp));

  return `${current}/${required} EXP`;
}

function getGrowthStageKey(stage: string | null | undefined): GrowthStageKey {
  const normalized = `${stage ?? ""}`.toUpperCase();

  if (normalized === "GROWING") {
    return "growing";
  }

  if (normalized === "MATURE") {
    return "mature";
  }

  return "baby";
}

const HOME_TAP_REACTIONS: Record<CharacterKey, string[]> = {
  mumu: [
    "무..! 무..!! 무무! (해석: 그만 눌러... 간지러워~)",
    "무우... 무! (해석: 방금 뿌리 끝이 움찔했어.)",
    "무? 무무. (해석: 나 불렀어? 조금 놀랐잖아.)",
    "무무무... (해석: 계속 누르면 숨겨 둔 생각이 새어 나올지도 몰라.)",
    "무! (해석: 지금은 살살. 마음까지 간질간질해.)",
    "무... 무우. (해석: 방금 건 기록해 둘게. 이상한 터치였어.)",
  ],
  nova: [
    "앗, 별빛이 살짝 흔들렸어.",
    "지금 나 부른 거지? 천천히 들을게.",
    "손끝에 작은 궤도가 생겼어.",
    "조금 간지럽지만, 나쁘진 않아.",
  ],
  jjori: [
    "흠흠, 터치 횟수 기록 중임!",
    "방금 건 원정 로그에 남겨야겠는데?",
    "오, 호출 신호 확인 완료!",
    "계속 누르면 내가 먼저 말을 걸지도 모름.",
  ],
};

function pickHomeTapReaction(characterKey: CharacterKey, characterName: string) {
  const pool = HOME_TAP_REACTIONS[characterKey] ?? HOME_TAP_REACTIONS.nova;
  const picked = pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
  return picked.replace(/\{name\}/g, characterName);
}

function shouldRequestHomeMemoryPeek(tapCount: number) {
  return tapCount % 5 === 0 || Math.random() < 0.22;
}

function getHomeMemoryFragmentAsset(fragmentType?: string) {
  if (fragmentType === "EASTER_EGG") return memoryAssets.fragmentEasterEgg;
  if (fragmentType === "LORE") return memoryAssets.fragmentLore;
  return memoryAssets.fragmentCommon;
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
