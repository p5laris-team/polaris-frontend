import { type ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { Button } from "../Button/Button";
import "./ErrorBoundary.css";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorFallbackProps = {
  eventId: string | null;
  resetError: () => void;
};

function ErrorFallback({ eventId, resetError }: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="error-boundary-fallback">
      <div className="error-boundary-fallback__card">
        <div className="error-boundary-fallback__icon">✨</div>
        <h1 className="error-boundary-fallback__title">화면을 불러오지 못했어요</h1>
        <p className="error-boundary-fallback__message">
          알 수 없는 오류가 발생했거나 네트워크 연결이 일시적으로 끊겼을 수 있습니다.
          아래 버튼을 눌러 다시 시도해 주세요.
        </p>
        {eventId && (
          <div className="error-boundary-fallback__event-id">
            오류 코드: <span>{eventId}</span>
          </div>
        )}
        <div className="error-boundary-fallback__actions">
          <Button variant="primary" onClick={resetError}>
            다시 시도
          </Button>
          <Button variant="secondary" onClick={handleGoHome}>
            홈으로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ eventId, resetError }) => (
        <ErrorFallback eventId={eventId} resetError={resetError} />
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
