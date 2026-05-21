import { type CSSProperties, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useActiveCharacterQuery } from "@/features/character/api/characterCareApi";
import { resolveCharacterImageUrl } from "@/features/character/model/characterAssetResolver";
import { useMissionFlowStore } from "@/features/mission/model/missionFlowStore";
import { routes } from "@/routes/paths";
import { effectAssets, emptyStateAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, Card } from "@/shared/ui";

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
    fallbackUrl: activeCharacterQuery.data?.currentAssetUrl,
  });

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
            <p>꾸준한 실천이 별친구의 하루를 반짝이게 해요.</p>
          </div>

          <Card className="mission-result__reward">
            <img
              alt=""
              className="mission-result__reward-stamp"
              src={effectAssets.rewardStamp}
            />
            <div className="mission-result__reward-copy">
              <span>보상 내역</span>
              <strong className="mission-result__reward-amount">
                <span>+{completionResult.reward.starPiece}</span>
                <em>별조각</em>
              </strong>
              {completionResult.reward.affection > 0 ? (
                <small>{character.name}의 애정 +{completionResult.reward.affection}</small>
              ) : null}
            </div>
          </Card>

          <Card className="mission-result__summary">
            <span>완료한 미션</span>
            <strong>{activeMission.title}</strong>
            <p>{completionResult.answer.text}</p>
          </Card>

          <div className="mission-result__bubble">{completionResult.characterMessage}</div>
          <p className="mission-result__wallet">
            보유 별조각 <strong>✦ {completionResult.wallet.starPiece}</strong>
          </p>
          <Button onClick={handleGoHome}>홈 화면으로 돌아가기</Button>
        </section>
      </AppShell>
    </main>
  );
}
