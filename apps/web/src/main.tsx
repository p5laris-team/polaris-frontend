/**
 * React 앱의 브라우저 진입점입니다.
 * 전역 디자인 토큰과 global CSS를 먼저 불러오고, provider로 감싼 App을 root DOM에 mount합니다.
 */
import React from "react";
import ReactDOM from "react-dom/client";

import "../../../colors_and_type.css";
import "./shared/styles/global.css";
import { App } from "./app/App";
import { AppProviders } from "./app/providers/AppProviders";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
