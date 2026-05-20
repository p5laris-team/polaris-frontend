import { type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { IconButton } from "@/shared/ui/IconButton/IconButton";
import "./Header.css";

type HeaderProps = {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
};

export function Header({ title, left, right, onBack }: HeaderProps) {
  return (
    // 모든 주요 화면 상단에 쓰는 sticky 헤더. 뒤로가기/좌우 액션 슬롯을 공통화한다.
    <header className="polaris-header">
      {onBack ? (
        <IconButton aria-label="뒤로" onClick={onBack}>
          <ArrowLeft size={22} strokeWidth={1.75} />
        </IconButton>
      ) : (
        left ?? <div className="polaris-header__spacer" />
      )}
      <h1 className="polaris-header__title">{title}</h1>
      {right ?? <div className="polaris-header__spacer" />}
    </header>
  );
}
