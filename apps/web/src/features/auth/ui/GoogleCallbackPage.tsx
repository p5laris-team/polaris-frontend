import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { createGoogleSession } from "@/features/auth/api/authApi";
import { useOnboardingSetupStore } from "@/features/onboarding/model/onboardingStore";
import { routes } from "@/routes/paths";
import { runtimeConfig } from "@/shared/config/env";
import { brandAssets } from "@/shared/assets/polarisAssets";
import { AppShell, useToast } from "@/shared/ui";
import { useAuthStore } from "@/stores/authStore";

const calledCodes = new Set<string>();

export function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const resetOnboardingFlow = useOnboardingSetupStore((state) => state.resetFlow);
  const { showToast } = useToast();
  const calledRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      showToast("로그인 인증 코드가 누락되었습니다.");
      navigate(routes.login, { replace: true });
      return;
    }

    // React 18 StrictMode runs useEffect twice in dev.
    // Use a local ref and a module-level Set to prevent double requests for the same code.
    if (calledRef.current || calledCodes.has(code)) return;
    calledRef.current = true;
    calledCodes.add(code);

    const handleCallback = async () => {
      try {
        const session = await createGoogleSession({
          code,
          state: state ?? "",
          redirectUri: runtimeConfig.oauthRedirectUri,
        });

        setSession(session);
        resetOnboardingFlow();
        showToast("성공적으로 로그인했습니다!");
        navigate("/", { replace: true });
      } catch (error) {
        console.error("OAuth callback login failed:", error);
        showToast("로그인 도중 오류가 발생했습니다.");
        navigate(routes.login, { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, setSession, resetOnboardingFlow, navigate, showToast]);

  return (
    <main className="app-page login-page">
      <AppShell>
        <section className="login-page__content" style={{ justifyContent: "center", alignItems: "center" }}>
          <div className="login-page__hero" style={{ textAlign: "center", marginBottom: 0 }}>
            <img 
              className="login-page__logo" 
              src={brandAssets.logomark} 
              alt="Polaris Logo" 
            />
            <h2 style={{ marginTop: "24px", fontSize: "1.25rem", color: "var(--color-text-primary, #2d3748)" }}>
              구글 로그인 처리 중입니다...
            </h2>
            <p style={{ marginTop: "8px", fontSize: "0.875rem", color: "var(--color-text-secondary, #718096)" }}>
              잠시만 기다려주세요.
            </p>
          </div>
        </section>
      </AppShell>
    </main>
  );
}
