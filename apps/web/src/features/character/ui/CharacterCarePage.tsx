import { type ReactNode, useMemo, useState } from "react";
import { Gamepad2, Moon, Shirt, Utensils, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toCharacterKey, type CharacterStates } from "@/entities/character/types";
import {
  useActiveCharacterQuery,
  useCharacterStatusQuery,
  useCreateCareLogMutation,
} from "@/features/character/api/characterCareApi";
import { resolveCharacterImageUrl } from "@/features/character/model/characterAssetResolver";
import { type CareActionType } from "@/features/character/model/characterCareTypes";
import { useInventoryConsumableItemsQuery } from "@/features/inventory/api/inventoryApi";
import {
  type InventoryItemEffectType,
  type UserInventoryItem,
} from "@/features/inventory/model/inventoryTypes";
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
  effectType: InventoryItemEffectType;
  itemLabel: string;
  description: string;
  icon: LucideIcon;
};

const careActions: CareActionConfig[] = [
  {
    type: "FEED",
    label: "밥 주기",
    effectType: "FOOD",
    itemLabel: "먹이 아이템",
    description: "포만감을 회복해요",
    icon: Utensils,
  },
  {
    type: "SLEEP",
    label: "재우기",
    effectType: "REST",
    itemLabel: "휴식 아이템",
    description: "기운을 회복해요",
    icon: Moon,
  },
  {
    type: "PLAY",
    label: "놀아주기",
    effectType: "PLAY",
    itemLabel: "장난감 아이템",
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
  const consumablesQuery = useInventoryConsumableItemsQuery();
  const careMutation = useCreateCareLogMutation();
  const [careMessage, setCareMessage] = useState("오늘 컨디션을 같이 살펴볼까요?");

  const character = activeCharacterQuery.data;
  const states = statusQuery.data?.states ?? character?.states;
  const gauges = useMemo(() => (states ? toCareGauges(states) : []), [states]);
  const consumableItems = consumablesQuery.data?.items ?? [];

  const handleCare = (action: CareActionConfig, item: UserInventoryItem | null) => {
    if (!character) return;

    if (!item || item.quantity <= 0) {
      showToast(`${action.itemLabel} 수량이 부족해요.`);
      return;
    }

    careMutation.mutate(
      {
        characterId: character.id,
        body: {
          actionType: action.type,
          itemId: item.itemId,
        },
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

  if (activeCharacterQuery.isLoading || statusQuery.isLoading || consumablesQuery.isLoading) {
    return <CharacterCareLoadingPage />;
  }

  if (
    activeCharacterQuery.isError ||
    statusQuery.isError ||
    consumablesQuery.isError ||
    !character ||
    !states
  ) {
    const error = activeCharacterQuery.error ?? statusQuery.error ?? consumablesQuery.error;

    return (
      <CharacterCareFrame>
        <div className="character-care-page__state">
          <h2>별친구 상태를 못 불러왔어요.</h2>
          <p>{getUserFacingErrorMessage(error)}</p>
          <Button
            onClick={() => {
              void activeCharacterQuery.refetch();
              void statusQuery.refetch();
              void consumablesQuery.refetch();
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
  const characterImageUrl = resolveCharacterImageUrl({
    character: characterKey,
    mood,
    states,
    equippedSkin: character.equippedSkin ?? null,
    fallbackUrl: character.currentAssetUrl,
  });

  return (
    <CharacterCareFrame>
      <div className="character-care-page__body">
        {/* SCR-012 캐릭터 상세: 활성 캐릭터와 상태 API를 합쳐 돌봄 전 현재 컨디션을 보여준다. */}
        <CharacterStage
          bubble={careMessage}
          character={characterKey}
          imageUrl={characterImageUrl}
          mood={mood}
          name={character.name}
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
            <span>보유 아이템으로 실행</span>
          </div>

          <div className="character-care-page__care-grid">
            {careActions.map((action) => {
              const Icon = action.icon;
              const item = findCareConsumable(consumableItems, action.effectType);
              const isUnavailable = !item || item.quantity <= 0;

              return (
                <button
                  className={`character-care-page__care-action${
                    isUnavailable ? " character-care-page__care-action--empty" : ""
                  }`}
                  disabled={careMutation.isPending || isUnavailable}
                  key={action.type}
                  onClick={() => handleCare(action, item)}
                  type="button"
                >
                  <Icon size={23} strokeWidth={1.8} />
                  <strong>{action.label}</strong>
                  <small>{action.description}</small>
                  <span>{item ? item.name : action.itemLabel}</span>
                  <em>{item ? `보유 ${item.quantity}개` : "보유 0개"}</em>
                </button>
              );
            })}
          </div>
        </section>

        <Card className="character-care-page__inventory-callout">
          <div>
            <strong>스킨은 보관함에서 바꿀 수 있어요.</strong>
            <p>보유 스킨을 장착하거나 기본 외형으로 되돌릴 수 있습니다.</p>
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
      guide: "시간이 지나면 조금씩 배고파져요. 먹이 아이템으로 든든하게 만들 수 있어요.",
    },
    {
      key: "energy",
      icon: "💤",
      label: "기운",
      value: states.energy.value,
      description: states.energy.label,
      tone: toGaugeTone(states.energy.grade),
      guide: "기운이 낮아지면 졸린 표정이 돼요. 휴식 아이템으로 푹 쉬게 할 수 있어요.",
    },
    {
      key: "affection",
      icon: "♡",
      label: "애정",
      value: states.affection.value,
      description: states.affection.label,
      tone: toGaugeTone(states.affection.grade),
      guide: "미션 완료와 장난감 아이템 사용으로 조금씩 가까워져요.",
    },
  ] as const;
}

function findCareConsumable(items: UserInventoryItem[], effectType: InventoryItemEffectType) {
  const candidates = items.filter(
    (item) => item.itemType === "CONSUMABLE" && item.effectType === effectType,
  );

  return candidates.find((item) => item.quantity > 0) ?? candidates[0] ?? null;
}

function toGaugeTone(grade: CharacterStates[keyof CharacterStates]["grade"]) {
  if (grade === "GOOD") return "good";
  if (grade === "BAD") return "bad";
  return "normal";
}

function toCharacterMood(states?: CharacterStates): CharacterMood {
  if (!states) return "idle";
  if (states.energy?.grade === "BAD") return "sleepy";
  if (states.affection?.grade === "GOOD") return "happy";
  return "idle";
}
