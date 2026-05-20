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

export function getGoogleAuthorizationUrl(redirectUri: string) {
  return unwrapApiResponse<GoogleAuthorizationUrlResponse>(
    apiClient.get("/api/auth/v1/google/authorization-url", {
      params: { redirectUri },
    }),
  );
}

export function createGoogleSession(body: GoogleSessionRequest) {
  return unwrapApiResponse<GoogleSessionResponse>(
    apiClient.post("/api/auth/v1/google/sessions", body),
  );
}

export function refreshToken(refreshToken: string) {
  return unwrapApiResponse<TokenRefreshResponse>(
    apiClient.post("/api/auth/v1/token-refreshes", { refreshToken }),
  );
}

export function logoutCurrentSession() {
  return unwrapApiResponse<{ loggedOut: boolean }>(
    apiClient.delete("/api/auth/v1/sessions/current"),
  );
}
