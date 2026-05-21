import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { AttendancePage } from "@/features/attendance/ui/AttendancePage";
import { LoginPage } from "@/features/auth/ui/LoginPage";
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
import { routes } from "@/routes/paths";
import { runtimeConfig } from "@/shared/config/env";
import { useAuthStore } from "@/stores/authStore";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path={routes.login} element={<LoginPage />} />
      <Route path={routes.designSystem} element={<DesignSystemPreviewPage />} />

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

function RootRedirect() {
  const hasSession = useAuthStore((state) => state.hasSession());
  const onboardingCompleted = useOnboardingSetupStore((state) => state.completed);

  if (!hasSession && !runtimeConfig.useApiFixtures) {
    return <Navigate to={routes.login} replace />;
  }

  // SCR-003~005가 끝나기 전에는 홈보다 온보딩 시작점을 먼저 보여준다.
  return <Navigate to={onboardingCompleted ? routes.home : routes.onboardingCharacter} replace />;
}

function ProtectedRoute() {
  const hasSession = useAuthStore((state) => state.hasSession());

  // fixture 모드에서는 실제 로그인 없이도 API 명세 기반 화면 뼈대를 확인할 수 있게 열어둔다.
  if (!hasSession && !runtimeConfig.useApiFixtures) {
    return <Navigate to={routes.login} replace />;
  }

  return <Outlet />;
}
