import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { AttendancePage } from "@/features/attendance/ui/AttendancePage";
import { LoginPage } from "@/features/auth/ui/LoginPage";
import { GoogleCallbackPage } from "@/features/auth/ui/GoogleCallbackPage";
import { CharacterCarePage } from "@/features/character/ui/CharacterCarePage";
import { HomePage } from "@/features/home/ui/HomePage";
import { InventoryPage } from "@/features/inventory/ui/InventoryPage";
import { MissionAnswerPage } from "@/features/mission/ui/MissionAnswerPage";
import { MissionHistoryPage } from "@/features/mission/ui/MissionHistoryPage";
import { MissionResultPage } from "@/features/mission/ui/MissionResultPage";
import { MyPage } from "@/features/my-page/ui/MyPage";
import { NotificationsPage } from "@/features/notifications/ui/NotificationsPage";
import { CharacterNamePage } from "@/features/onboarding/ui/CharacterNamePage";
import { CharacterSelectPage } from "@/features/onboarding/ui/CharacterSelectPage";
import { OnboardingSurveyPage } from "@/features/onboarding/ui/OnboardingSurveyPage";
import { useOnboardingSetupStore } from "@/features/onboarding/model/onboardingStore";
import { ShareCardPage } from "@/features/share/ui/ShareCardPage";
import { ShopPage } from "@/features/shop/ui/ShopPage";
import { WalletPage } from "@/features/wallet/ui/WalletPage";
import { DesignSystemPreviewPage } from "@/pages/DesignSystemPreviewPage";
import { TestErrorPage } from "@/pages/TestErrorPage";
import { routes } from "@/routes/paths";
import { runtimeConfig } from "@/shared/config/env";
import { useAuthStore } from "@/stores/authStore";

/**
 * Polaris 웹앱의 URL과 화면 컴포넌트를 연결하는 중앙 라우터입니다.
 * 로그인/온보딩/서비스 화면의 진입 조건을 이 파일에서 한눈에 확인할 수 있습니다.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path={routes.login} element={<LoginPage />} />
      <Route path={routes.googleCallback} element={<GoogleCallbackPage />} />
      <Route path={routes.designSystem} element={<DesignSystemPreviewPage />} />
      <Route path={routes.testError} element={<TestErrorPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path={routes.onboardingCharacter} element={<CharacterSelectPage />} />
        <Route path={routes.onboardingCharacterName} element={<CharacterNamePage />} />
        <Route path={routes.onboardingQuestions} element={<OnboardingSurveyPage />} />
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.missions} element={<MissionHistoryPage />} />
        <Route path={routes.missionAnswer} element={<MissionAnswerPage />} />
        <Route path={routes.missionResult} element={<MissionResultPage />} />
        <Route path={routes.character} element={<CharacterCarePage />} />
        <Route path={routes.shop} element={<ShopPage />} />
        <Route path={routes.inventory} element={<InventoryPage />} />
        <Route path={routes.wallet} element={<WalletPage />} />
        <Route path={routes.share} element={<ShareCardPage />} />
        <Route path={routes.attendance} element={<AttendancePage />} />
        <Route path={routes.notifications} element={<NotificationsPage />} />
        <Route path={routes.myPage} element={<MyPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * 루트(`/`)로 들어온 사용자를 현재 상태에 맞는 첫 화면으로 보냅니다.
 * fixture 모드에서는 로그인 없이도 온보딩부터 확인할 수 있게 열어 둡니다.
 */
function RootRedirect() {
  const hasSession = useAuthStore((state) => state.hasSession());
  const onboardingCompleted = useOnboardingSetupStore((state) => state.completed);
  const createdCharacter = useOnboardingSetupStore((state) => state.createdCharacter);
  const selectedCharacter = useOnboardingSetupStore((state) => state.selectedCharacter);

  if (!hasSession && !runtimeConfig.useApiFixtures) {
    return <Navigate to={routes.login} replace />;
  }

  if (onboardingCompleted) {
    return <Navigate to={routes.home} replace />;
  }

  if (createdCharacter) {
    return <Navigate to={routes.onboardingQuestions} replace />;
  }

  if (selectedCharacter) {
    return <Navigate to={routes.onboardingCharacterName} replace />;
  }

  return <Navigate to={routes.onboardingCharacter} replace />;
}

/**
 * 실제 API 모드에서 로그인하지 않은 사용자가 보호된 화면에 들어가지 못하게 막는 라우트 가드입니다.
 */
function ProtectedRoute() {
  const hasSession = useAuthStore((state) => state.hasSession());

  // fixture 모드에서는 실제 로그인 없이도 API 명세 기반 화면 뼈대를 확인할 수 있게 열어둔다.
  if (!hasSession && !runtimeConfig.useApiFixtures) {
    return <Navigate to={routes.login} replace />;
  }

  return <Outlet />;
}
