/**
 * 아이콘 중심 버튼 공통 컴포넌트입니다.
 * 헤더 액션, 지갑/알림 버튼처럼 텍스트보다 아이콘이 주가 되는 클릭 영역에 사용합니다.
 */
import { type ButtonHTMLAttributes, type ReactNode } from "react";

import "./IconButton.css";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

/** 기본 icon-button class와 HTML button 속성을 그대로 합쳐 렌더링합니다. */
export function IconButton({ children, className = "", type = "button", ...props }: IconButtonProps) {
  return (
    <button className={`icon-button ${className}`.trim()} type={type} {...props}>
      {children}
    </button>
  );
}
