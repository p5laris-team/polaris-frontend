/**
 * Polaris 공통 카드 컴포넌트입니다.
 * 정보 묶음, 빈 상태, 통계 카드처럼 반복되는 박스 스타일을 한 class 규칙으로 맞춥니다.
 */
import { type HTMLAttributes } from "react";

import "./Card.css";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

/** 기본 카드 class와 선택적인 interactive modifier를 합쳐 반환합니다. */
export function Card({ interactive = false, className = "", ...props }: CardProps) {
  const classes = ["polaris-card", interactive ? "polaris-card--interactive" : "", className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}
