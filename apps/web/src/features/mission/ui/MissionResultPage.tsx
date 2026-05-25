import { type CSSProperties, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useActiveCharacterQuery } from "@/features/character/api/characterCareApi";
import { resolveCharacterImageUrl } from "@/features/character/model/characterAssetResolver";
import { useMissionFlowStore } from "@/features/mission/model/missionFlowStore";
import { routes } from "@/routes/paths";
import { effectAssets, emptyStateAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, Card, StarPieceAmount } from "@/shared/ui";

import "./MissionResultPage.css";

export function MissionResultPage() {
  const navigate = useNavigate();
  const activeCharacterQuery = useActiveCharacterQuery();
  const { activeMission, character, completionResult, clearMissionFlow } = useMissionFlowStore();
  const sparkles = useMemo(
    () =>
      [
        { id: 0, x: "-138px", y: "-74px", size: "112px", rotate: "-14deg", delay: "0s" },
        { id: 1, x: "118px", y: "-58px", size: "96px", rotate: "18deg", delay: "0.12s" },
        { id: 2, x: "-112px", y: "76px", size: "92px", rotate: "12deg", delay: "0.24s" },
      ],
    [],
  );

  const handleGoHome = () => {
    clearMissionFlow();
    navigate(routes.home);
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
              <Button onClick={handleGoHome}>홈으로</Button>
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
            <p>오늘의 작은 실천을 별조각으로 남겼어요.</p>
          </div>

          <Card className="mission-result__reward">
            <div className="mission-result__reward-copy">
              <span className="mission-result__eyebrow">보상 획득</span>
              <StarPieceAmount
                amount={completionResult.reward.starPiece}
                className="mission-result__reward-amount"
                prefix="+"
                showLabel
                size="lg"
              />
              <span className="mission-result__wallet-chip">
                현재 보유
                <StarPieceAmount
                  amount={completionResult.wallet.starPiece}
                  className="mission-result__wallet-amount"
                  size="xs"
                />
              </span>
              {rewardAffection > 0 ? (
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

          <Button onClick={handleGoHome}>홈 화면으로 돌아가기</Button>
        </section>
      </AppShell>
    </main>
  );
}
