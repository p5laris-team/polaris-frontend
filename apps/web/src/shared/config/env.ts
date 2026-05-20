const browserOrigin = typeof window === "undefined" ? "" : window.location.origin;

export const runtimeConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  oauthRedirectUri:
    import.meta.env.VITE_OAUTH_REDIRECT_URI ?? `${browserOrigin}/oauth/google/callback`,
  // 백엔드가 연결되기 전에는 API 명세와 같은 모양의 fixture로 화면 흐름을 먼저 검증한다.
  useApiFixtures: import.meta.env.VITE_USE_API_FIXTURES !== "false",
};
