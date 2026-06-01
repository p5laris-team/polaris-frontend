const browserOrigin = typeof window === "undefined" ? "" : window.location.origin;

const stringOrEmpty = (value: unknown) => (typeof value === "string" ? value : "");

/**
 * Vite 환경 변수를 앱에서 쓰기 좋은 형태로 정리한 런타임 설정입니다.
 * fixture 모드와 실제 API 모드를 이 값으로 전환합니다.
 */
export const runtimeConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  oauthRedirectUri:
    import.meta.env.VITE_OAUTH_REDIRECT_URI ?? `${browserOrigin}/oauth/google/callback`,
  // 백엔드가 연결되기 전에는 API 명세와 같은 모양의 fixture로 화면 흐름을 먼저 검증한다.
  useApiFixtures: import.meta.env.VITE_USE_API_FIXTURES !== "false",
  webPush: {
    // 운영/스테이징 환경에서만 웹 푸시를 켤 수 있게 명시 플래그를 둔다.
    enabled: import.meta.env.VITE_WEB_PUSH_ENABLED === "true",
    firebase: {
      apiKey: stringOrEmpty(import.meta.env.VITE_FIREBASE_API_KEY),
      authDomain: stringOrEmpty(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
      projectId: stringOrEmpty(import.meta.env.VITE_FIREBASE_PROJECT_ID),
      storageBucket: stringOrEmpty(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
      messagingSenderId: stringOrEmpty(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      appId: stringOrEmpty(import.meta.env.VITE_FIREBASE_APP_ID),
      measurementId: stringOrEmpty(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
    },
    vapidKey: stringOrEmpty(import.meta.env.VITE_FIREBASE_VAPID_KEY),
  },
  sentry: {
    dsn: stringOrEmpty(import.meta.env.VITE_SENTRY_DSN),
    environment: stringOrEmpty(import.meta.env.VITE_SENTRY_ENV || "development"),
    enabled: import.meta.env.VITE_SENTRY_ENABLED === "true" || !!import.meta.env.VITE_SENTRY_DSN,
    release: stringOrEmpty(import.meta.env.VITE_RELEASE_VERSION || "polaris-web@1.0.0"),
  },
};
