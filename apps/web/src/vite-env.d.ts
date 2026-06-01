/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENV?: string;
  readonly VITE_SENTRY_ENABLED?: string;
  readonly VITE_RELEASE_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

