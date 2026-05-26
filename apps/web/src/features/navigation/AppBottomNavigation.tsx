/**
 * 앱 전역 하단 탭 네비게이션입니다.
 * 현재 URL로 활성 탭을 계산하고 탭 선택을 route 이동으로 연결합니다.
 */
import { useLocation, useNavigate } from "react-router-dom";

import { BottomTabs, type BottomTabKey } from "@/shared/ui";
import { routes } from "@/routes/paths";

const routeByTab: Record<BottomTabKey, string> = {
  home: routes.home,
  missions: routes.missions,
  character: routes.character,
  shop: routes.shop,
  me: routes.myPage,
};

/** 현재 pathname이 어느 하단 탭에 속하는지 판단합니다. */
function resolveActiveTab(pathname: string): BottomTabKey {
  if (pathname.startsWith(routes.missions)) return "missions";
  if (pathname.startsWith(routes.character)) return "character";
  if (pathname.startsWith(routes.shop)) return "shop";
  if (pathname.startsWith(routes.myPage)) return "me";

  return "home";
}

/** BottomTabs 공통 UI에 라우팅 규칙을 연결하는 feature 컴포넌트입니다. */
export function AppBottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    // 하단 탭의 라우팅은 한 곳에서만 관리해서 화면별 이동 규칙이 흩어지지 않게 한다.
    <BottomTabs
      active={resolveActiveTab(location.pathname)}
      onChange={(tab) => navigate(routeByTab[tab])}
    />
  );
}
