import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { LoginPage } from "@/features/auth/ui/LoginPage";
import { CharacterCarePage } from "@/features/character/ui/CharacterCarePage";
import { HomePage } from "@/features/home/ui/HomePage";
import { MissionAnswerPage } from "@/features/mission/ui/MissionAnswerPage";
import { MissionResultPage } from "@/features/mission/ui/MissionResultPage";
import { CharacterNamePage } from "@/features/onboarding/ui/CharacterNamePage";
import { CharacterSelectPage } from "@/features/onboarding/ui/CharacterSelectPage";
import { OnboardingSurveyPage } from "@/features/onboarding/ui/OnboardingSurveyPage";
import { useOnboardingSetupStore } from "@/features/onboarding/model/onboardingStore";
import { DesignSystemPreviewPage } from "@/pages/DesignSystemPreviewPage";
import { RoutePlaceholderPage } from "@/pages/RoutePlaceholderPage";
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
        <Route
          path={routes.missions}
          element={
            <RoutePlaceholderPage
              screenId="SCR-011"
              title="미션 기록"
              description="오늘 제안·거절·완료한 미션 스택을 보여줄 자리예요."
              apiNote="MVP API 미제공: 우선 클라이언트 세션 기록 또는 후속 API 확인 필요"
            />
          }
        />
        <Route path={routes.missionAnswer} element={<MissionAnswerPage />} />
        <Route path={routes.missionResult} element={<MissionResultPage />} />
        <Route path={routes.character} element={<CharacterCarePage />} />
        <Route
          path={routes.shop}
          element={
            <RoutePlaceholderPage
              screenId="SCR-013"
              title="상점"
              description="스킨과 소모품을 별조각으로 구매하는 화면이에요."
              apiNote="GET /api/item/v1/items?itemType=SKIN|CONSUMABLE"
            />
          }
        />
        <Route
          path={routes.inventory}
          element={
            <RoutePlaceholderPage
              screenId="SCR-014"
              title="인벤토리"
              description="보유 스킨 장착과 소모품 사용 흐름을 붙일 화면이에요."
              apiNote="GET /api/item/v1/user-items, PUT /api/character/v1/characters/{characterId}/equipped-skin"
            />
          }
        />
        <Route
          path={routes.wallet}
          element={
            <RoutePlaceholderPage
              screenId="SCR-015"
              title="별조각"
              description="현재 별조각 잔액과 추후 거래 내역을 보여줄 화면이에요."
              apiNote="GET /api/wallet/v1/wallets/me"
            />
          }
        />
        <Route
          path={routes.share}
          element={
            <RoutePlaceholderPage
              screenId="SCR-016"
              title="공유 카드"
              description="캐릭터 카드를 이미지로 만들고 공유 보상 이벤트를 기록할 화면이에요."
              apiNote="GET /api/share/v1/presigned-url → PUT upload → POST /api/share/v1/share-cards"
            />
          }
        />
        <Route
          path={routes.attendance}
          element={
            <RoutePlaceholderPage
              screenId="SCR-019"
              title="출석 체크"
              description="오늘 출석 보상과 월별 출석 기록을 보여줄 화면이에요."
              apiNote="POST /api/attendance/v1/attendance-records, GET /api/attendance/v1/attendance-records"
            />
          }
        />
        <Route
          path={routes.notifications}
          element={
            <RoutePlaceholderPage
              screenId="SCR-020"
              title="알림"
              description="알림 목록과 읽음 처리를 연결할 화면이에요."
              apiNote="GET /api/notification/v1/notifications, PATCH /api/notification/v1/notifications/{notificationId}"
            />
          }
        />
        <Route
          path={routes.myPage}
          element={
            <RoutePlaceholderPage
              screenId="SCR-021"
              title="마이페이지"
              description="내 정보, 알림 로컬 설정, 로그아웃을 모을 화면이에요."
              apiNote="GET /api/user/v1/users/me, DELETE /api/auth/v1/sessions/current"
            />
          }
        />
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
