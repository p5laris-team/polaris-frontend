/**
 * 별조각 금액 표시 공통 컴포넌트입니다.
 * 지갑, 상점, 보상 화면에서 아이콘과 숫자 형식을 일관되게 맞춥니다.
 */
import { currencyAssets } from "@/shared/assets/polarisAssets";

import "./StarPieceAmount.css";

type StarPieceAmountProps = {
  amount: number;
  className?: string;
  prefix?: string;
  showLabel?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  tone?: "default" | "accent" | "muted" | "danger" | "success";
};

/** 금액 부호, 천 단위 포맷, 크기/톤 class를 계산해 접근성 라벨까지 함께 제공합니다. */
export function StarPieceAmount({
  amount,
  className,
  prefix,
  showLabel = false,
  size = "sm",
  tone = "default",
}: StarPieceAmountProps) {
  const sign = prefix ?? (amount < 0 ? "-" : "");
  const formattedAmount = Math.abs(amount).toLocaleString("ko-KR");
  const classNames = [
    "star-piece-amount",
    `star-piece-amount--${size}`,
    `star-piece-amount--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classNames} aria-label={`${sign}${formattedAmount} 별조각`}>
      {sign ? (
        <span className="star-piece-amount__sign" aria-hidden="true">
          {sign}
        </span>
      ) : null}
      <img
        alt=""
        aria-hidden="true"
        className="star-piece-amount__icon"
        src={currencyAssets.starPiece}
      />
      <span className="star-piece-amount__value" aria-hidden="true">
        {formattedAmount}
      </span>
      {showLabel ? (
        <span className="star-piece-amount__label" aria-hidden="true">
          별조각
        </span>
      ) : null}
    </span>
  );
}
