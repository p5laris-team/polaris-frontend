/**
 * 선택 가능한 작은 pill 버튼입니다.
 * 필터나 빠른 선택 UI가 필요할 때 selected 상태를 class로 표현합니다.
 */
import { type ButtonHTMLAttributes } from "react";

import "./Chip.css";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

/** selected modifier와 기본 button 속성을 합쳐 렌더링합니다. */
export function Chip({ selected = false, className = "", type = "button", ...props }: ChipProps) {
  return (
    <button
      className={`polaris-chip ${selected ? "polaris-chip--selected" : ""} ${className}`.trim()}
      type={type}
      {...props}
    />
  );
}
