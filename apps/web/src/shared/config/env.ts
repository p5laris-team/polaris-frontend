const browserOrigin = typeof window === "undefined" ? "" : window.location.origin;

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
};
