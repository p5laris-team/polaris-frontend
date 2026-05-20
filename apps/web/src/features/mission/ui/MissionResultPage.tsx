import { type CSSProperties, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useMissionFlowStore } from "@/features/mission/model/missionFlowStore";
import { routes } from "@/routes/paths";
import { characterAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, Card } from "@/shared/ui";

import "./MissionResultPage.css";

export function MissionResultPage() {
  const navigate = useNavigate();
  const { activeMission, character, completionResult, clearMissionFlow } = useMissionFlowStore();
  const sparkles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => ({
        id: index,
        x: `${(index % 7) * 34 - 100}px`,
        y: `${Math.floor(index / 7) * 42 - 78}px`,
        delay: `${index * 0.06}s`,
      })),
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
            <Card>
              <h2>완료 결과가 없어요.</h2>
              <p>홈에서 미션을 완료한 뒤 다시 확인해 주세요.</p>
              <Button onClick={handleGoHome}>홈으로</Button>
            </Card>
          </div>
        </AppShell>
      </main>
    );
  }

  return (
    <main className="app-page mission-result">
      <AppShell>
        <section className="mission-result__body">
          {/* SCR-010 완료 결과: 답변 제출 이후에만 보상, 지갑 스냅샷, 캐릭터 반응을 보여준다. */}
          <div className="mission-result__celebration" aria-label="미션 완료 축하">
            {sparkles.map((sparkle) => (
              <span
                aria-hidden="true"
                className="mission-result__spark"
                key={sparkle.id}
                style={{
                  "--spark-x": sparkle.x,
                  "--spark-y": sparkle.y,
                  animationDelay: sparkle.delay,
                } as CSSProperties}
              >
                ✦
              </span>
            ))}
            <img src={characterAssets[character.key].happy} alt="" />
          </div>

          <div className="mission-result__headline">
            <h1>미션 달성 완료!</h1>
            <p>꾸준한 실천이 별친구의 하루를 반짝이게 해요.</p>
          </div>

          <Card className="mission-result__reward">
            <span>보상 내역</span>
            <strong>+{completionResult.reward.starPiece} 별조각</strong>
            <small>{character.name}의 애정 +{completionResult.reward.affection}</small>
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
