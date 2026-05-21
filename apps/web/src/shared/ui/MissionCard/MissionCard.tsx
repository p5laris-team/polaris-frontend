import { categoryAssets, type CategoryKey } from "@/shared/assets/polarisAssets";
import { StarPieceAmount } from "@/shared/ui/StarPieceAmount";

import "./MissionCard.css";

type MissionCardProps = {
  title: string;
  description: string;
  category: CategoryKey;
  rewardStarPiece?: number;
  status?: "idle" | "active" | "completed" | "locked";
  onClick?: () => void;
};

export function MissionCard({
  title,
  description,
  category,
  rewardStarPiece,
  status = "idle",
  onClick,
}: MissionCardProps) {
  const disabled = status === "locked";
  const rewardContent =
    status === "completed" ? (
      "완료"
    ) : rewardStarPiece ? (
      <StarPieceAmount amount={rewardStarPiece} prefix="+" size="xs" tone="accent" />
    ) : null;

  return (
    // 미션은 목록 선택 UX가 아니라 현재 제안된 작은 행동 1개를 명확히 보여주는 카드로 쓴다.
    <button
      className={`mission-card mission-card--${status}`}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <span className="mission-card__icon" aria-hidden="true">
        <img src={categoryAssets[category]} alt="" />
      </span>
      <span className="mission-card__body">
        <span className="mission-card__title">{title}</span>
        <span className="mission-card__description">{description}</span>
      </span>
      {rewardContent ? <span className="mission-card__reward">{rewardContent}</span> : null}
    </button>
  );
}
