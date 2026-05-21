import { AppInitializer } from "@/app/providers/AppInitializer";
import { AppRouter } from "@/routes/AppRouter";

export function App() {
  // PR2부터는 실제 서비스 라우트와 개발용 디자인 미리보기를 AppRouter에서 함께 관리한다.
  return (
    <AppInitializer>
      <AppRouter />
    </AppInitializer>
  );
}
