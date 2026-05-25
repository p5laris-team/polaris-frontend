/**
 * Google OAuth 로그인과 로그아웃 API를 담당하는 파일입니다.
 * 화면 컴포넌트는 이 파일을 통해 인가 URL 조회, callback code 교환, token refresh, logout을 호출합니다.
 */
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { type AuthUser } from "@/stores/authStore";

export type GoogleAuthorizationUrlResponse = {
  authorizationUrl: string;
  state: string;
};

export type GoogleSessionRequest = {
  code: string;
  state: string;
  redirectUri: string;
};

export type GoogleSessionResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type TokenRefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

/** Google 로그인 버튼을 눌렀을 때 이동할 OAuth 인가 URL을 백엔드에서 받아옵니다. */
export function getGoogleAuthorizationUrl(redirectUri: string) {
  return unwrapApiResponse<GoogleAuthorizationUrlResponse>(
    apiClient.get("/api/auth/v1/google/authorization-url", {
      params: { redirectUri },
    }),
  );
}

/** OAuth callback으로 받은 code/state를 백엔드에 보내 Polaris 로그인 세션을 만듭니다. */
export function createGoogleSession(body: GoogleSessionRequest) {
  return unwrapApiResponse<GoogleSessionResponse>(
    apiClient.post("/api/auth/v1/google/sessions", body),
  );
}

/** access token이 만료되었을 때 refresh token으로 새 token 쌍을 발급받습니다. */
export function refreshToken(refreshToken: string) {
  return unwrapApiResponse<TokenRefreshResponse>(
    apiClient.post("/api/auth/v1/token-refreshes", { refreshToken }),
  );
}

/** 현재 로그인 세션을 백엔드에서 종료하고 refresh token 재사용을 막습니다. */
export function logoutCurrentSession() {
  return unwrapApiResponse<{ loggedOut: boolean }>(
    apiClient.delete("/api/auth/v1/sessions/current"),
  );
}
