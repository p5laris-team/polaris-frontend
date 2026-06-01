/**
 * React 앱의 브라우저 진입점입니다.
 * 전역 디자인 토큰과 global CSS를 먼저 불러오고, provider로 감싼 App을 root DOM에 mount합니다.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";

import "../../../colors_and_type.css";
import "./shared/styles/global.css";
import { App } from "./app/App";
import { AppProviders } from "./app/providers/AppProviders";
import { runtimeConfig } from "./shared/config/env";

if (runtimeConfig.sentry.enabled && runtimeConfig.sentry.dsn) {
  Sentry.init({
    dsn: runtimeConfig.sentry.dsn,
    environment: runtimeConfig.sentry.environment,
    release: runtimeConfig.sentry.release,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Tracing
    tracesSampleRate: runtimeConfig.sentry.environment === "production" ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    
    // PII masking to prevent sending tokens, codes, or credentials
    beforeSend(event) {
      try {
        if (event.request?.headers) {
          delete event.request.headers["Authorization"];
          delete event.request.headers["authorization"];
          delete event.request.headers["X-Refresh-Token"];
          delete event.request.headers["x-refresh-token"];
        }
      } catch (e) {
        // Safe catch
      }

      // Clean authorization or tokens inside breadcrumbs data
      if (event.breadcrumbs) {
        event.breadcrumbs.forEach((breadcrumb) => {
          if (breadcrumb.data && breadcrumb.data.headers) {
            const headers = breadcrumb.data.headers;
            delete headers["Authorization"];
            delete headers["authorization"];
            delete headers["X-Refresh-Token"];
            delete headers["x-refresh-token"];
          }
        });
      }
      return event;
    },
  });
}


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
