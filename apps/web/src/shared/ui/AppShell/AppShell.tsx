/**
 * 모바일 앱처럼 보이도록 화면 폭과 배경을 잡는 최상위 shell입니다.
 * 모든 주요 페이지가 이 컴포넌트 안에서 렌더링되어 UI kit의 420px 기준을 유지합니다.
 */
import { type ReactNode } from "react";

import "./AppShell.css";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    // 모바일 퍼스트 앱 프레임. UI kit의 420px 중심 shell을 실제 앱에서도 유지한다.
    <div className="polaris-app app-shell" data-testid="app-shell">
      {children}
    </div>
  );
}
