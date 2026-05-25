import { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { queryClient } from "@/shared/api";
import { ToastProvider } from "@/shared/ui";

type AppProvidersProps = {
  children: ReactNode;
};

/**
 * 앱 전체에서 공유하는 외부 provider를 한곳에 모아 두는 조립 컴포넌트입니다.
 * 서버 상태, 라우팅, 토스트처럼 모든 화면이 의존하는 기능은 여기에서 감쌉니다.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        {/* 전역 토스트는 API 성공/실패, 돌봄/구매/공유 결과 안내에 공통 사용한다. */}
        <ToastProvider>{children}</ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
