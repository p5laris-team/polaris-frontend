import { type ReactNode, useMemo, useState } from "react";
import { Gamepad2, Moon, Shirt, Utensils, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toCharacterKey, type CharacterStates } from "@/entities/character/types";
import {
  useActiveCharacterQuery,
  useCharacterStatusQuery,
  useCreateCareLogMutation,
} from "@/features/character/api/characterCareApi";
import { type CareActionType } from "@/features/character/model/characterCareTypes";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import {
  AppShell,
  Button,
  Card,
  CharacterStage,
  Header,
  StatusGauge,
  Tag,
  useToast,
} from "@/shared/ui";
import { type CharacterMood } from "@/shared/assets/polarisAssets";

import "./CharacterCarePage.css";

type CareActionConfig = {
  type: CareActionType;
  label: string;
  costLabel: string;
  description: string;
  icon: LucideIcon;
};

const careActions: CareActionConfig[] = [
  {
    type: "FEED",
    label: "밥 주기",
    costLabel: "3✦",
    description: "포만감을 회복해요",
    icon: Utensils,
  },
  {
    type: "SLEEP",
    label: "재우기",
    costLabel: "무료",
    description: "기운을 회복해요",
    icon: Moon,
  },
  {
    type: "PLAY",
    label: "놀아주기",
    costLabel: "2✦",
    description: "애정을 회복해요",
    icon: Gamepad2,
  },
];

export function CharacterCarePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const activeCharacterQuery = useActiveCharacterQuery();
  const characterId = activeCharacterQuery.data?.id ?? null;
  const statusQuery = useCharacterStatusQuery(characterId);
  const careMutation = useCreateCareLogMutation();
  const [careMessage, setCareMessage] = useState("오늘 컨디션을 같이 살펴볼까요?");

  const character = activeCharacterQuery.data;
  const states = statusQuery.data?.states ?? character?.states;
  const gauges = useMemo(() => (states ? toCareGauges(states) : []), [states]);

  const handleCare = (actionType: CareActionType) => {
    if (!character) return;

    careMutation.mutate(
      {
        characterId: character.id,
        body: { actionType },
      },
      {
        onSuccess: (result) => {
          setCareMessage(result.characterMessage);
          showToast(result.characterMessage);
        },
        onError: (error) => {
          showToast(getUserFacingErrorMessage(error));
        },
      },
    );
  };

  if (activeCharacterQuery.isLoading || statusQuery.isLoading) {
    return <CharacterCareLoadingPage />;
  }

  if (activeCharacterQuery.isError || statusQuery.isError || !character || !states) {
    const error = activeCharacterQuery.error ?? statusQuery.error;

    return (
      <CharacterCareFrame>
        <div className="character-care-page__state">
          <h2>별친구 상태를 못 불러왔어요.</h2>
          <p>{getUserFacingErrorMessage(error)}</p>
          <Button
            onClick={() => {
              void activeCharacterQuery.refetch();
              void statusQuery.refetch();
            }}
          >
            다시 불러오기
          </Button>
        </div>
      </CharacterCareFrame>
    );
  }

  const characterKey = toCharacterKey(character.characterTypeCode);
  const mood = toCharacterMood(states);

  return (
    <CharacterCareFrame>
      <div className="character-care-page__body">
        {/* SCR-012 캐릭터 상세: 활성 캐릭터와 상태 API를 합쳐 돌봄 전 현재 컨디션을 보여준다. */}
        <CharacterStage
          bubble={careMessage}
          character={characterKey}
          mood={mood}
          name={character.name}
          stats={[
            { label: "포만감", value: `${states.hunger.value}%` },
            { label: "기운", value: `${states.energy.value}%` },
            { label: "애정", value: `${states.affection.value}%` },
          ]}
        />

        <Card className="character-care-page__status-card">
          <div className="character-care-page__section-title">
            <h2>상태 상세</h2>
            <Tag variant={mood === "happy" ? "primary" : "neutral"}>Lv.1 별친구</Tag>
          </div>
          <div className="character-care-page__gauge-list">
            {gauges.map((gauge) => (
              <div className="character-care-page__gauge-item" key={gauge.key}>
                <StatusGauge
                  label={`${gauge.icon} ${gauge.label} · ${gauge.description}`}
                  tone={gauge.tone}
                  value={gauge.value}
                />
                <p>{gauge.guide}</p>
              </div>
            ))}
          </div>
        </Card>

        <section className="character-care-page__care-section" aria-label="돌봄 활동 선택">
          <div className="character-care-page__section-title">
            <h2>돌봄 활동 선택</h2>
            <span>보유 별조각으로 바로 실행</span>
          </div>

          <div className="character-care-page__care-grid">
            {careActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  className="character-care-page__care-action"
                  disabled={careMutation.isPending}
                  key={action.type}
                  onClick={() => handleCare(action.type)}
                  type="button"
                >
                  <Icon size={23} strokeWidth={1.8} />
                  <strong>{action.label}</strong>
                  <small>{action.description}</small>
                  <span>{action.costLabel}</span>
                </button>
              );
            })}
          </div>
        </section>

        <Card className="character-care-page__inventory-callout">
          <div>
            <strong>스킨과 소모품은 다음 흐름에서 이어져요.</strong>
            <p>이번 PR은 별조각/무료 돌봄 액션까지만 붙이고, 보유 아이템 사용은 SCR-014에서 연결합니다.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate(routes.inventory)}>
            <Shirt size={18} strokeWidth={1.8} />
            스킨 바꾸기
          </Button>
        </Card>
      </div>
    </CharacterCareFrame>
  );
}

function CharacterCareFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <main className="character-care-page">
      <AppShell>
        <Header title="상태 상세 및 돌봄" onBack={() => navigate(routes.home)} />
        {children}
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}

function CharacterCareLoadingPage() {
  return (
    <CharacterCareFrame>
      <div className="character-care-page__body">
        <div className="character-care-page__skeleton character-care-page__skeleton--stage" />
        <div className="character-care-page__skeleton" />
        <div className="character-care-page__skeleton character-care-page__skeleton--actions" />
      </div>
    </CharacterCareFrame>
  );
}

function toCareGauges(states: CharacterStates) {
  return [
    {
      key: "hunger",
      icon: "🍚",
      label: "포만감",
      value: states.hunger.value,
      description: states.hunger.label,
      tone: toGaugeTone(states.hunger.grade),
      guide: "시간이 지나면 조금씩 배고파져요. 밥 주기로 든든하게 만들 수 있어요.",
    },
    {
      key: "energy",
      icon: "💤",
      label: "기운",
      value: states.energy.value,
      description: states.energy.label,
      tone: toGaugeTone(states.energy.grade),
      guide: "기운이 낮아지면 졸린 표정이 돼요. 재우기는 별조각 없이 사용할 수 있어요.",
    },
    {
      key: "affection",
      icon: "♡",
      label: "애정",
      value: states.affection.value,
      description: states.affection.label,
      tone: toGaugeTone(states.affection.grade),
      guide: "미션 완료와 놀아주기로 조금씩 가까워져요.",
    },
  ] as const;
}

function toGaugeTone(grade: CharacterStates[keyof CharacterStates]["grade"]) {
  if (grade === "GOOD") return "good";
  if (grade === "BAD") return "bad";
  return "normal";
}

function toCharacterMood(states: CharacterStates): CharacterMood {
  if (states.energy.grade === "BAD") return "sleepy";
  if (states.affection.grade === "GOOD") return "happy";
  return "idle";
}
