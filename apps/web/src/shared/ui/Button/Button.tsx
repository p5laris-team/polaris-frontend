import { type ButtonHTMLAttributes } from "react";

import "./Button.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "google";
type ButtonSize = "default" | "large" | "compact";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

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
