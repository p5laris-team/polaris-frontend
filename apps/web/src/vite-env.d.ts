/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: string;
  readonly VITE_ADSENSE_DISABLE_REAL_REQUESTS?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENV?: string;
  readonly VITE_SENTRY_ENABLED?: string;
  readonly VITE_RELEASE_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

