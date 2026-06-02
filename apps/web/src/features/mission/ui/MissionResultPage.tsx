/**
 * 미션 완료 결과 화면입니다.
 * 답변 제출 후 받은 보상, 지갑 잔액, 캐릭터 반응을 한 번에 보여주고
 * 확인이 끝나면 임시 미션 흐름 상태를 비운 뒤 홈으로 돌아갑니다.
 */
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { type MissionFeedbackReaction } from "@/entities/mission/types";
import { useActiveCharacterQuery } from "@/features/character/api/characterCareApi";
import { useUpsertMissionFeedbackMutation } from "@/features/mission/api/missionApi";
import { resolveCharacterImageUrl } from "@/features/character/model/characterAssetResolver";
import { useMissionFlowStore } from "@/features/mission/model/missionFlowStore";
import { routes } from "@/routes/paths";
import { effectAssets, emptyStateAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, Card, StarPieceAmount } from "@/shared/ui";

import "./MissionResultPage.css";

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

  const characterImageUrl = resolveCharacterImageUrl({
    character: character.key,
    mood: "happy",
    equippedSkin: activeCharacterQuery.data?.equippedSkin ?? null,
    assetUrls: activeCharacterQuery.data?.assetUrls,
    fallbackUrl: activeCharacterQuery.data?.currentAssetUrl,
  });
  const rewardAffection = completionResult.reward.affection;
  const rewardStatus = completionResult.rewardStatus ?? "PAID";
  const isRewardPending = rewardStatus === "PENDING" || rewardStatus === "PROCESSING";
  const isRewardFailed = rewardStatus === "FAILED";
  const rewardCardClassName = [
    "mission-result__reward",
    isRewardPending ? "mission-result__reward--pending" : "",
    isRewardFailed ? "mission-result__reward--failed" : "",
  ]
    .filter(Boolean)
    .join(" ");

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
            <img className="mission-result__character" src={characterImageUrl} alt="" />
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
              <span className="mission-result__eyebrow">
                {isRewardPending
                  ? "별조각 지급 확인 중"
                  : isRewardFailed
                    ? "별조각 지급 확인 필요"
                    : "보상 획득"}
              </span>
              <StarPieceAmount
                amount={completionResult.reward.starPiece}
                className="mission-result__reward-amount"
                prefix="+"
                showLabel
                size="lg"
              />
              {isRewardPending || isRewardFailed ? (
                <span className="mission-result__wallet-chip mission-result__wallet-chip--notice">
                  지급이 완료되면 알림으로 알려드릴게요.
                </span>
              ) : (
                <span className="mission-result__wallet-chip">
                  현재 보유
                  <StarPieceAmount
                    amount={completionResult.wallet.starPiece}
                    className="mission-result__wallet-amount"
                    size="xs"
                  />
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
            <img
              alt=""
              className="mission-result__reward-stamp"
              src={effectAssets.rewardStamp}
            />
          </Card>

          <Card className="mission-result__summary">
            <span className="mission-result__eyebrow">완료한 미션</span>
            <strong>{activeMission.title}</strong>
            <p className="mission-result__answer">{completionResult.answer.text}</p>
          </Card>

          <Card className="mission-result__message-card">
            <img alt="" className="mission-result__message-avatar" src={characterImageUrl} />
            <div className="mission-result__message-copy">
              <span className="mission-result__eyebrow">{character.name}의 한마디</span>
              <p>{completionResult.characterMessage}</p>
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
