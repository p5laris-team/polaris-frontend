import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Header, AppShell, useToast } from "@/shared/ui";
import { runtimeConfig } from "@/shared/config/env";
import { apiClient } from "@/shared/api";
import "./TestErrorPage.css";

export function TestErrorPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [triggerCrash, setTriggerCrash] = useState(false);

  if (triggerCrash) {
    throw new Error("Sentry Test: React Rendering Error boundary trigger!");
  }

  const handleRenderError = () => {
    setTriggerCrash(true);
  };

  const handlePromiseRejection = () => {
    showToast("비동기 예외(Promise Rejection)를 발생시켰습니다.");
    Promise.reject(new Error("Sentry Test: Unhandled Promise Rejection!"));
  };

  const handleApi500Error = async () => {
    showToast("서버 500 에러를 유발하는 API를 요청합니다.");
    try {
      // Calling a simulated API endpoint to test the interceptor
      await apiClient.get("/api/test/v1/fail-500");
    } catch (error) {
      console.log("Captured expected API error:", error);
    }
  };

  const handleNetworkError = async () => {
    showToast("네트워크 장애(타임아웃/존재하지 않는 도메인)를 유발합니다.");
    try {
      await apiClient.get("https://invalid-domain-for-testing-polaris-sentry.com/api/test");
    } catch (error) {
      console.log("Captured expected network error:", error);
    }
  };

  const handleTokenRefreshError = async () => {
    showToast("토큰 만료 후 재발급 실패 상황을 모사합니다.");
    try {
      await apiClient.post("/api/auth/v1/token-refreshes", {
        refreshToken: "invalid_refresh_token_for_sentry_test",
      });
    } catch (error) {
      console.log("Captured expected token refresh error:", error);
    }
  };

  return (
    <main className="test-error-page">
      <AppShell>
        <Header title="에러 모니터링 테스트" onBack={() => navigate("/")} />
        <div className="test-error-page__content">
          <Card className="test-error-page__info-card">
            <h3>Sentry 구성 상태</h3>
            <ul>
              <li>
                <strong>DSN:</strong>
                <code>{runtimeConfig.sentry.dsn || "비어 있음"}</code>
              </li>
              <li>
                <strong>환경(Environment):</strong>
                <code>{runtimeConfig.sentry.environment}</code>
              </li>
              <li>
                <strong>활성화 여부(Enabled):</strong>
                <code className={runtimeConfig.sentry.enabled ? "status-on" : "status-off"}>
                  {runtimeConfig.sentry.enabled ? "ON" : "OFF"}
                </code>
              </li>
              <li>
                <strong>릴리즈 버전:</strong>
                <code>{runtimeConfig.sentry.release}</code>
              </li>
            </ul>
          </Card>

          <section className="test-error-page__actions">
            <h4>런타임 및 비동기 예외</h4>
            <div className="test-error-page__btn-group">
              <Button variant="primary" onClick={handleRenderError}>
                React Rendering 에러 유발 (ErrorBoundary 테스트)
              </Button>
              <Button variant="secondary" onClick={handlePromiseRejection}>
                비동기 Promise Rejection 에러 유발
              </Button>
            </div>

            <h4>API 및 네트워크 예외 (Interceptor 테스트)</h4>
            <div className="test-error-page__btn-group">
              <Button variant="secondary" onClick={handleApi500Error}>
                HTTP 500 서버 에러 유발
              </Button>
              <Button variant="secondary" onClick={handleNetworkError}>
                네트워크 접속 차단 에러 유발
              </Button>
              <Button variant="secondary" onClick={handleTokenRefreshError}>
                토큰 재발급(Refresh) 실패 유발
              </Button>
            </div>
          </section>
        </div>
      </AppShell>
    </main>
  );
}
