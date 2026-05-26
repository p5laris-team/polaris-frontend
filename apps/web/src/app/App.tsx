import { AppInitializer } from "@/app/providers/AppInitializer";
import { AppRouter } from "@/routes/AppRouter";

/**
 * 웹앱의 최상위 화면 컴포넌트입니다.
 * 앱 시작 시 필요한 사용자/캐릭터 초기화를 먼저 수행한 뒤 실제 라우터를 렌더링합니다.
 */
export function App() {
  return (
    <AppInitializer>
      <AppRouter />
    </AppInitializer>
  );
}
