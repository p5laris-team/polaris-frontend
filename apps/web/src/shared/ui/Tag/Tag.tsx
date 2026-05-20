import { type HTMLAttributes } from "react";

import "./Tag.css";

type TagVariant = "primary" | "accent" | "neutral";

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: TagVariant;
};

export function Tag({ variant = "primary", className = "", ...props }: TagProps) {
  return <span className={`polaris-tag polaris-tag--${variant} ${className}`.trim()} {...props} />;
}
