import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getGoogleAuthorizationUrl } from "@/features/auth/api/authApi";
import { demoAuthSession } from "@/features/auth/model/authFixtures";
import { useOnboardingSetupStore } from "@/features/onboarding/model/onboardingStore";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { brandAssets } from "@/shared/assets/polarisAssets";
import { runtimeConfig } from "@/shared/config/env";
import { AppShell, Button, useToast } from "@/shared/ui";
import { useAuthStore } from "@/stores/authStore";

import "./LoginPage.css";

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const resetOnboardingFlow = useOnboardingSetupStore((state) => state.resetFlow);
  const { showToast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      if (runtimeConfig.useApiFixtures) {
        setSession(demoAuthSession);
        resetOnboardingFlow();
        showToast("개발용 로그인으로 온보딩을 시작해요.");
        navigate(routes.onboardingCharacter, { replace: true });
        return;
      }

      const { authorizationUrl } = await getGoogleAuthorizationUrl(runtimeConfig.oauthRedirectUri);
      window.location.assign(authorizationUrl);
    } catch (error) {
      showToast(getUserFacingErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-page login-page">
      <AppShell>
        {/* SCR-002 Google 로그인: UI kit의 로고/슬로건/하단 약관 구조를 실제 라우트로 옮긴다. */}
        <section className="login-page__content">
          <div className="login-page__hero">
            <img className="login-page__logo" src={brandAssets.logomark} alt="" />
            <h1>
              오늘 한 게 없다고?
              <br />
              무무는 봤는데.
            </h1>
            <p>
              작은 하루가 별조각이 되고,
              <br />
              별친구가 그걸 기억하는 AI 루틴 서비스
            </p>
          </div>

          <div className="login-page__actions">
            <Button variant="google" size="large" disabled={loading} onClick={handleGoogleLogin}>
              <span className="login-page__google-mark" aria-hidden="true">
                G
              </span>
              {loading ? "Google로 이어가는 중..." : "Google 계정으로 시작하기"}
            </Button>
            <p className="login-page__terms">
              가입 시 서비스 약관 및 개인정보 처리방침에 자동으로 동의하게 돼요.
            </p>
            <span className="login-page__dev-note">
              <Sparkles size={14} strokeWidth={1.8} />
              API fixture 모드에서는 버튼 클릭 시 캐릭터 선택으로 이동합니다.
            </span>
          </div>
        </section>
      </AppShell>
    </main>
  );
}
