import { type AuthUser } from "@/stores/authStore";

export const demoAuthUser: AuthUser = {
  id: 1,
  email: "demo@polaris.app",
  nickname: "별따라걷기",
  provider: "GOOGLE",
  role: "USER",
};

export const demoAuthSession = {
  accessToken: "demo-access-token",
  refreshToken: "demo-refresh-token",
  user: demoAuthUser,
};
