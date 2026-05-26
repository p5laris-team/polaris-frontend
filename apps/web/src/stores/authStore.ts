import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AuthUser = {
  id: number;
  email: string;
  nickname: string;
  provider: "GOOGLE";
  role: "USER";
};

type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  hasSession: () => boolean;
};

/**
 * 로그인 세션을 보관하는 전역 store입니다.
 * 새로고침 후에도 인증 상태를 유지해야 하므로 access/refresh token과 사용자 정보를 localStorage에 저장합니다.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (session) => set(session),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
      hasSession: () => Boolean(get().accessToken),
    }),
    {
      name: "polaris-web-auth",
      // 로그인 세션은 새로고침 후에도 홈 진입 분기 판단에 필요해서 localStorage에 보관한다.
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
