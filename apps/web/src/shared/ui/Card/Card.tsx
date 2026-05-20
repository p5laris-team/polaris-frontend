import { type HTMLAttributes } from "react";

import "./Card.css";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export function Card({ interactive = false, className = "", ...props }: CardProps) {
  const classes = ["polaris-card", interactive ? "polaris-card--interactive" : "", className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}
