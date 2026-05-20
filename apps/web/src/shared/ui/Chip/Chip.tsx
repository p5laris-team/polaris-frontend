import { type ButtonHTMLAttributes } from "react";

import "./Chip.css";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function Chip({ selected = false, className = "", type = "button", ...props }: ChipProps) {
  return (
    <button
      className={`polaris-chip ${selected ? "polaris-chip--selected" : ""} ${className}`.trim()}
      type={type}
      {...props}
    />
  );
}
