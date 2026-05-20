import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { AppShell, Button, Card, Header } from "@/shared/ui";

import "./RoutePlaceholderPage.css";

type RoutePlaceholderPageProps = {
  screenId: string;
  title: string;
  description: string;
  supportText?: string;
};

export function RoutePlaceholderPage({
  screenId,
  title,
  description,
  supportText,
}: RoutePlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <main className="app-page placeholder-page">
      <AppShell>
        <Header title={title} />
        <section className="placeholder-page__body">
          {/* 아직 독립 화면이 아닌 보조 라우트다. 사용자에게는 현재 가능한 확인 경로만 안내한다. */}
          <Card className="placeholder-page__card">
            <span className="placeholder-page__screen-id">{screenId}</span>
            <h2>{title}</h2>
            <p>{description}</p>
            {supportText ? <small>{supportText}</small> : null}
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
