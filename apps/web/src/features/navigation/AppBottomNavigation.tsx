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

function resolveActiveTab(pathname: string): BottomTabKey {
  if (pathname.startsWith(routes.missions)) return "missions";
  if (pathname.startsWith(routes.character)) return "character";
  if (pathname.startsWith(routes.shop)) return "shop";
  if (pathname.startsWith(routes.myPage)) return "me";

  return "home";
}

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
