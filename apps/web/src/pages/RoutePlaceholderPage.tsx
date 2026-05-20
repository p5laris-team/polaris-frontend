import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { AppShell, Button, Card, Header } from "@/shared/ui";

import "./RoutePlaceholderPage.css";

type RoutePlaceholderPageProps = {
  screenId: string;
  title: string;
  description: string;
  apiNote: string;
};

export function RoutePlaceholderPage({
  screenId,
  title,
  description,
  apiNote,
}: RoutePlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <main className="app-page placeholder-page">
      <AppShell>
        <Header title={title} />
        <section className="placeholder-page__body">
          {/* 아직 실제 화면이 아닌 라우트 자리표시자다. 다음 PR에서 SCR 단위로 API mutation을 연결한다. */}
          <Card className="placeholder-page__card">
            <span className="placeholder-page__screen-id">{screenId}</span>
            <h2>{title}</h2>
            <p>{description}</p>
            <small>{apiNote}</small>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={17} strokeWidth={1.8} />
              이전 화면
            </Button>
          </Card>
        </section>
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}
