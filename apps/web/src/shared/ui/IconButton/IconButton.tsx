import { type ButtonHTMLAttributes, type ReactNode } from "react";

import "./IconButton.css";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function IconButton({ children, className = "", type = "button", ...props }: IconButtonProps) {
  return (
    <button className={`icon-button ${className}`.trim()} type={type} {...props}>
      {children}
    </button>
  );
}
