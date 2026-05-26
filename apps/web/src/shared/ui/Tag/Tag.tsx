/**
 * 작은 상태 라벨 공통 컴포넌트입니다.
 * 난이도, 보유 상태, 읽음 여부처럼 짧은 메타 정보를 같은 시각 언어로 보여줍니다.
 */
import { type HTMLAttributes } from "react";

import "./Tag.css";

type TagVariant = "primary" | "accent" | "neutral";

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: TagVariant;
};

/** variant에 맞는 색상 modifier class를 붙인 span을 반환합니다. */
export function Tag({ variant = "primary", className = "", ...props }: TagProps) {
  return <span className={`polaris-tag polaris-tag--${variant} ${className}`.trim()} {...props} />;
}
