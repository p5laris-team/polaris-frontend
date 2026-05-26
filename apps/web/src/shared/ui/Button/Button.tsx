/**
 * Polaris 공통 버튼 컴포넌트입니다.
 * variant와 size만 바꿔 대부분의 CTA/보조/ghost/Google 버튼을 같은 CSS 규칙으로 맞춥니다.
 */
import { type ButtonHTMLAttributes } from "react";

import "./Button.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "google";
type ButtonSize = "default" | "large" | "compact";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** HTML button 속성은 그대로 받되, 디자인 시스템 variant/size class를 자동으로 붙입니다. */
export function Button({
  variant = "primary",
  size = "default",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = ["polaris-button", `polaris-button--${variant}`, `polaris-button--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} type={type} {...props} />;
}
