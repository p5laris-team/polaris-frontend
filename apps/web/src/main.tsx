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
