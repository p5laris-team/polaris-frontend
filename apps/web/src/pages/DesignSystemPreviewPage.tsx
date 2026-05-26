import { useState } from "react";
import { Bell, Check, Sparkles, WalletCards } from "lucide-react";

import {
  AppShell,
  BottomTabs,
  Button,
  Card,
  CharacterStage,
  Chip,
  Header,
  IconButton,
  MissionCard,
  Modal,
  ProgressRing,
  StatusGauge,
  Tag,
  TextField,
  useToast,
  type BottomTabKey,
} from "@/shared/ui";

import "./DesignSystemPreviewPage.css";

export function DesignSystemPreviewPage() {
  const [activeTab, setActiveTab] = useState<BottomTabKey>("home");
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <main className="preview-page">
      <AppShell>
        {/* SCR-006 홈 상단 헤더 형태를 기준으로 지갑/알림 액션 슬롯을 확인한다. */}
        <Header
          title="Polaris"
          left={
            <IconButton aria-label="별조각 지갑">
              <WalletCards size={22} strokeWidth={1.75} />
            </IconButton>
          }
          right={
            <IconButton aria-label="알림">
              <Bell size={22} strokeWidth={1.75} />
            </IconButton>
          }
        />

        <div className="design-preview">
          {/* 캐릭터 무대: 홈, 돌봄, 완료 결과 화면에서 가장 중요한 브랜드 신호다. */}
          <section className="design-preview__hero">
            <CharacterStage
              character="mumu"
              name="작은무무"
              bubble="무... 오늘의 작은 별을 찾은 것 같아요."
              stats={[
                { label: "애정", value: "68%" },
                { label: "별조각", value: 240 },
                { label: "연속", value: "4일" },
              ]}
            />
          </section>

          {/* 버튼/칩/입력/모달처럼 여러 화면에서 반복되는 기본 조작 요소를 확인한다. */}
          <section className="design-preview__section">
            <div className="design-preview__section-title">
              <h2>기본 컴포넌트</h2>
              <Tag>Latte</Tag>
            </div>
            <Card className="design-preview__stack">
              <Button onClick={() => showToast("오늘의 별조각 후보를 찾았어요.")}>
                <Sparkles size={18} strokeWidth={1.8} />
                시작하기
              </Button>
              <Button variant="secondary" onClick={() => setModalOpen(true)}>
                구매 확인 보기
              </Button>
              <Button variant="ghost">다른 미션 볼게요</Button>
              <div className="design-preview__chips">
                <Chip selected>스킨</Chip>
                <Chip>소모품</Chip>
                <Chip>공유</Chip>
              </div>
              <TextField label="친구 이름" placeholder="예) 작은무무" hint="1~10자까지 입력할 수 있어요." />
            </Card>
          </section>

          {/* 미션 카드: SCR-006/007에서 현재 미션 1개를 제안하는 핵심 컴포넌트다. */}
          <section className="design-preview__section">
            <div className="design-preview__section-title">
              <h2>미션 카드</h2>
              <span>오늘 3 / 15</span>
            </div>
            <div className="design-preview__stack">
              <MissionCard
                title="창문 열고 숨 고르기"
                description="공기 한 번 바꾸기"
                category="morning"
                rewardStarPiece={10}
                status="active"
                onClick={() => showToast("미션 카드가 선택됐어요.")}
              />
              <MissionCard
                title="좋았던 문장 저장하기"
                description="읽던 글에서 한 줄만"
                category="reading"
                rewardStarPiece={12}
                status="completed"
              />
            </div>
          </section>

          {/* 상태/진행률: 홈과 캐릭터 상세에서 포만감(hunger), 기운, 애정을 보여준다. */}
          <section className="design-preview__section design-preview__metrics">
            <Card>
              <ProgressRing value={62} label="오늘" />
            </Card>
            <Card className="design-preview__gauge-card">
              <StatusGauge label="포만감" value={80} tone="good" />
              <StatusGauge label="기운" value={55} />
              <StatusGauge label="애정" value={28} tone="bad" />
            </Card>
          </section>
        </div>

        <BottomTabs active={activeTab} onChange={setActiveTab} />

        <Modal
          open={modalOpen}
          title="말랑 별빛 스킨"
          confirmText="구매하기"
          onConfirm={() => {
            setModalOpen(false);
            showToast("별조각이 예쁜 걸로 바뀌었어요.");
          }}
          onCancel={() => setModalOpen(false)}
        >
          별조각 60개를 사용해 이 스킨을 구매할까요?
        </Modal>
      </AppShell>
    </main>
  );
}
