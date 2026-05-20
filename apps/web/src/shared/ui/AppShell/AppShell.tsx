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
