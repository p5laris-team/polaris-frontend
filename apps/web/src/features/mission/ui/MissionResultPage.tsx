/**
 * 미션 완료 결과 화면입니다.
 * 답변 제출 후 받은 보상, 지갑 잔액, 캐릭터 반응을 한 번에 보여주고
 * 확인이 끝나면 임시 미션 흐름 상태를 비운 뒤 홈으로 돌아갑니다.
 */
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  type MissionCompletionResultResponse,
  type MissionFeedbackReaction,
} from "@/entities/mission/types";
import { useActiveCharacterQuery } from "@/features/character/api/characterCareApi";
import { CharacterGrowthMeter } from "@/features/character/ui/CharacterGrowthMeter";
import { useUpsertMissionFeedbackMutation } from "@/features/mission/api/missionApi";
import {
  resolveCharacterGrowthAssetLevel,
  resolveCharacterImageUrl,
} from "@/features/character/model/characterAssetResolver";
import { formatCharacterSpeech } from "@/features/character/model/characterToneText";
import { useMissionFlowStore } from "@/features/mission/model/missionFlowStore";
import { routes } from "@/routes/paths";
import { currencyAssets, effectAssets, emptyStateAssets, rewardEffectAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, Card } from "@/shared/ui";

import "./MissionResultPage.css";

type CharacterExpReward = NonNullable<MissionCompletionResultResponse["characterExp"]>;

export function MissionResultPage() {
  const navigate = useNavigate();
  const activeCharacterQuery = useActiveCharacterQuery();
  const feedbackMutation = useUpsertMissionFeedbackMutation();
  const { activeMission, character, completionResult, clearMissionFlow } = useMissionFlowStore();
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(true);
  const [selectedReaction, setSelectedReaction] = useState<MissionFeedbackReaction | null>(null);
  const [feedbackState, setFeedbackState] = useState<"idle" | "saved" | "failed">("idle");
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const sparkles = useMemo(
    () =>
      [
        { id: 0, x: "-138px", y: "-74px", size: "112px", rotate: "-14deg", delay: "0s" },
        { id: 1, x: "118px", y: "-58px", size: "96px", rotate: "18deg", delay: "0.12s" },
        { id: 2, x: "-112px", y: "76px", size: "92px", rotate: "12deg", delay: "0.24s" },
      ],
    [],
  );

  useEffect(() => {
    if (!isFeedbackVisible) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      if (feedbackRef.current?.contains(target)) return;
      if (target.closest("[data-feedback-dismiss-ignore='true']")) return;
      setIsFeedbackVisible(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isFeedbackVisible]);

  /** 결과 확인 후 이전 미션 상태가 남지 않도록 store를 정리하고 홈으로 이동합니다. */
  const handleGoHome = () => {
    clearMissionFlow();
    navigate(routes.home);
  };

  const handleFeedback = (reaction: MissionFeedbackReaction) => {
    if (!completionResult || feedbackMutation.isPending) return;

    setSelectedReaction(reaction);
    setFeedbackState("idle");
    feedbackMutation.mutate(
      {
        missionId: completionResult.missionId,
        body: {
          feedbackType: "SATISFACTION",
          reaction,
        },
      },
      {
        onSuccess: () => {
          setFeedbackState("saved");
          window.setTimeout(() => setIsFeedbackVisible(false), 700);
        },
        onError: () => {
          setFeedbackState("failed");
        },
      },
    );
  };

  if (!completionResult || !activeMission || !character) {
    return (
      <main className="app-page mission-result">
        <AppShell>
          <div className="mission-result__empty">
            <Card className="mission-result__empty-card">
              <img
                alt=""
                className="mission-result__empty-illustration"
                src={emptyStateAssets.mission}
              />
              <h2>완료 결과가 없어요.</h2>
              <p>홈에서 미션을 완료한 뒤 다시 확인해 주세요.</p>
              <Button data-feedback-dismiss-ignore="true" onClick={handleGoHome}>
                홈으로
              </Button>
            </Card>
          </div>
        </AppShell>
      </main>
    );
  }

  const resultGrowth =
    completionResult.characterExp?.afterGrowth ??
    activeCharacterQuery.data?.growth ??
    character.growth ??
    null;
  const resultGrowthLevel = resolveCharacterGrowthAssetLevel(resultGrowth);
  const resultCharacterClassName = [
    "mission-result__character",
    resultGrowthLevel ? `mission-result__character--${resultGrowthLevel}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const messageAvatarClassName = [
    "mission-result__message-avatar",
    resultGrowthLevel ? `mission-result__message-avatar--${resultGrowthLevel}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const characterImageUrl = resolveCharacterImageUrl({
    character: character.key,
    mood: "happy",
    growth: resultGrowth,
    equippedSkin: activeCharacterQuery.data?.equippedSkin ?? null,
    assetUrls: activeCharacterQuery.data?.assetUrls,
    fallbackUrl: activeCharacterQuery.data?.currentAssetUrl,
  });
  const rewardAffection = completionResult.reward.affection;
  const rewardStatus = completionResult.rewardStatus ?? "PAID";
  const isRewardPending = rewardStatus === "PENDING" || rewardStatus === "PROCESSING";
  const isRewardFailed = rewardStatus === "FAILED";
  const rewardStatusAsset = isRewardPending
    ? rewardEffectAssets.pendingClock
    : isRewardFailed
      ? rewardEffectAssets.failedSoft
      : effectAssets.rewardStamp;
  const rewardCardClassName = [
    "mission-result__reward",
    isRewardPending ? "mission-result__reward--pending" : "",
    isRewardFailed ? "mission-result__reward--failed" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const characterExp = completionResult.characterExp ?? null;

  return (
    <main className="app-page mission-result">
      <AppShell>
        <section className="mission-result__body">
          {/* SCR-010 완료 결과: 답변 제출 이후에만 보상, 지갑 스냅샷, 캐릭터 반응을 보여준다. */}
          <div className="mission-result__celebration" aria-label="미션 완료 축하">
            <img
              alt=""
              className="mission-result__burst"
              src={effectAssets.sparkleBurst}
            />
            {sparkles.map((sparkle) => (
              <img
                aria-hidden="true"
                alt=""
                className="mission-result__spark"
                key={sparkle.id}
                src={effectAssets.starParticle}
                style={{
                  "--spark-x": sparkle.x,
                  "--spark-y": sparkle.y,
                  "--spark-size": sparkle.size,
                  "--spark-rotate": sparkle.rotate,
                  animationDelay: sparkle.delay,
                } as CSSProperties}
              />
            ))}
            <img className={resultCharacterClassName} src={characterImageUrl} alt="" />
          </div>

          <div className="mission-result__headline">
            <h1>미션 달성 완료!</h1>
            <p>
              {isRewardPending
                ? "별조각은 확인 중이에요. 완료되면 알림으로 알려드릴게요."
                : isRewardFailed
                  ? "별조각 지급 확인이 필요해요. 잠시 후 다시 알려드릴게요."
                  : "오늘의 작은 실천을 별조각으로 남겼어요."}
            </p>
          </div>

          <Card className={rewardCardClassName}>
            <div className="mission-result__reward-copy">
              <div className="mission-result__reward-top">
                <span className="mission-result__eyebrow">
                  {isRewardPending
                    ? "지급 확인 중"
                    : isRewardFailed
                      ? "지급 확인 필요"
                      : "보상 획득"}
                </span>
              </div>
              <strong className="mission-result__reward-earned">
                <img src={currencyAssets.starPiece} alt="" />
                +{completionResult.reward.starPiece}
                <span>별조각</span>
              </strong>
              {isRewardPending || isRewardFailed ? (
                <span className="mission-result__wallet-chip mission-result__wallet-chip--notice">
                  지급이 완료되면 알림으로 알려드릴게요.
                </span>
              ) : (
                <span className="mission-result__wallet-chip">
                  현재 보유 별조각 {completionResult.wallet.starPiece.toLocaleString("ko-KR")}개
                </span>
              )}
              {isRewardPending ? (
                <small className="mission-result__reward-note">
                  완료 기록은 저장됐고, 별조각만 다시 확인하고 있어요.
                </small>
              ) : isRewardFailed ? (
                <small className="mission-result__reward-note">
                  확인이 끝나면 알림으로 안내할게요.
                </small>
              ) : rewardAffection > 0 ? (
                <small>{character.name}의 애정 +{rewardAffection}</small>
              ) : null}
            </div>
            {rewardStatusAsset ? (
              <img
                alt=""
                className="mission-result__reward-stamp"
                src={rewardStatusAsset}
              />
            ) : null}
            {isRewardFailed ? (
              <img
                alt=""
                className="mission-result__reward-retry"
                src={rewardEffectAssets.retrySpark}
              />
            ) : null}
          </Card>

          {characterExp ? (
            <GrowthRewardCard
              characterExp={characterExp}
              characterName={character.name}
            />
          ) : null}

          <Card className="mission-result__summary">
            <span className="mission-result__eyebrow">완료한 미션</span>
            <strong>{activeMission.title}</strong>
            <p className="mission-result__answer">{completionResult.answer.text}</p>
          </Card>

          <Card className="mission-result__message-card">
            <img alt="" className={messageAvatarClassName} src={characterImageUrl} />
            <div className="mission-result__message-copy">
              <span className="mission-result__eyebrow">{character.name}의 한마디</span>
              <p>{formatCharacterSpeech(character.key, completionResult.characterMessage, character.name)}</p>
            </div>
          </Card>

          {isFeedbackVisible ? (
            <div className="mission-result__quick-feedback" ref={feedbackRef}>
              <div className="mission-result__quick-feedback-copy">
                <strong>이 미션 어땠어요?</strong>
                <span>
                  {feedbackState === "saved"
                    ? "다음 추천에 살짝 반영할게요."
                    : feedbackState === "failed"
                      ? "저장은 잠깐 실패했어요."
                      : "한 번만 톡 눌러주면 돼요."}
                </span>
              </div>
              <div className="mission-result__quick-feedback-actions">
                <button
                  aria-label="좋았어요"
                  aria-pressed={selectedReaction === "LIKE"}
                  className={
                    selectedReaction === "LIKE"
                      ? "mission-result__quick-feedback-button mission-result__quick-feedback-button--selected"
                      : "mission-result__quick-feedback-button"
                  }
                  disabled={feedbackMutation.isPending}
                  onClick={() => handleFeedback("LIKE")}
                  type="button"
                >
                  <ThumbsUp size={17} strokeWidth={1.9} />
                </button>
                <button
                  aria-label="아쉬웠어요"
                  aria-pressed={selectedReaction === "DISLIKE"}
                  className={
                    selectedReaction === "DISLIKE"
                      ? "mission-result__quick-feedback-button mission-result__quick-feedback-button--selected"
                      : "mission-result__quick-feedback-button"
                  }
                  disabled={feedbackMutation.isPending}
                  onClick={() => handleFeedback("DISLIKE")}
                  type="button"
                >
                  <ThumbsDown size={17} strokeWidth={1.9} />
                </button>
              </div>
            </div>
          ) : null}

          <Button data-feedback-dismiss-ignore="true" onClick={handleGoHome}>
            홈 화면으로 돌아가기
          </Button>
        </section>
      </AppShell>
    </main>
  );
}

function GrowthRewardCard({
  characterExp,
  characterName,
}: {
  characterExp: CharacterExpReward;
  characterName: string;
}) {
  const afterGrowth = characterExp.afterGrowth;
  const beforeLevel = characterExp.beforeGrowth?.level ?? null;
  const afterLevel = afterGrowth?.level ?? null;
  const levelUp = characterExp.levelUp && afterLevel !== null;
  const isPending = characterExp.status === "PENDING" || characterExp.status === "PROCESSING";
  const isFailed = characterExp.status === "FAILED";
  const expGained = Math.max(0, characterExp.expGained || characterExp.expAmount);

  if (!levelUp) {
    const stripClassName = [
      "mission-result__exp-strip",
      isPending ? "mission-result__exp-strip--pending" : "",
      isFailed ? "mission-result__exp-strip--failed" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const meta = isPending
      ? "반영 확인 중"
      : isFailed
        ? "확인 필요"
        : afterGrowth?.maxLevel
          ? "최대 성장"
          : afterGrowth?.expToNextLevel != null
            ? `다음 Lv까지 ${afterGrowth.expToNextLevel}`
            : "성장 중";

    return (
      <Card className={stripClassName}>
        <img className="mission-result__exp-strip-icon" src={effectAssets.expOrb} alt="" />
        <div className="mission-result__exp-strip-copy">
          <span>{isPending ? "경험치 확인 중" : isFailed ? "경험치 확인 필요" : "경험치"}</span>
          <strong>+{expGained} EXP</strong>
        </div>
        <em>{meta}</em>
      </Card>
    );
  }

  const rootClassName = [
    "mission-result__growth-reward",
    "mission-result__growth-reward--level-up",
    isPending ? "mission-result__growth-reward--pending" : "",
    isFailed ? "mission-result__growth-reward--failed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card className={rootClassName}>
      <div className="mission-result__growth-visual" aria-hidden="true">
        <img
          alt=""
          className="mission-result__growth-burst"
          src={effectAssets.levelUpBurst}
        />
        <img className="mission-result__growth-trail" src={effectAssets.expTrail} alt="" />
        <img
          alt=""
          className="mission-result__growth-orb mission-result__growth-orb--one"
          src={effectAssets.expOrb}
        />
        <img
          alt=""
          className="mission-result__growth-orb mission-result__growth-orb--two"
          src={effectAssets.expOrb}
        />
      </div>
      <div className="mission-result__growth-copy">
        <span className="mission-result__eyebrow">
          {isPending ? "성장 반영 중" : isFailed ? "성장 확인 필요" : "레벨업"}
        </span>
        <strong>
          {beforeLevel !== null
            ? `Lv.${beforeLevel} → Lv.${afterLevel}`
            : `Lv.${afterLevel}`}
        </strong>
        <p>
          {isPending
            ? "성장 반영을 확인하고 있어요."
            : isFailed
              ? "성장 반영 확인이 필요해요."
              : `${characterName}의 모습이 한 단계 자랐어요.`}
        </p>
      </div>
      <CharacterGrowthMeter
        className="mission-result__growth-meter"
        growth={afterGrowth}
      />
    </Card>
  );
}
