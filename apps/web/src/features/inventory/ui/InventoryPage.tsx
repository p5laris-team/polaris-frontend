import { type ReactNode, useMemo, useState } from "react";
import { Check, CircleOff, ShoppingBag, Sparkles, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getCharacterTypeLabelById,
  toCharacterKey,
  toCharacterTypeId,
  type CharacterStates,
} from "@/entities/character/types";
import { useActiveCharacterQuery } from "@/features/character/api/characterCareApi";
import {
  useInventorySkinItemsQuery,
  useUpdateEquippedSkinMutation,
} from "@/features/inventory/api/inventoryApi";
import { type UserInventoryItem } from "@/features/inventory/model/inventoryTypes";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import {
  AppShell,
  Button,
  Card,
  CharacterStage,
  Header,
  Tag,
  useToast,
} from "@/shared/ui";
import { type CharacterMood } from "@/shared/assets/polarisAssets";

import "./InventoryPage.css";

type PendingTarget = number | "base" | null;

export function InventoryPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const activeCharacterQuery = useActiveCharacterQuery();
  const skinsQuery = useInventorySkinItemsQuery();
  const equipMutation = useUpdateEquippedSkinMutation();
  const [pendingTarget, setPendingTarget] = useState<PendingTarget>(null);

  const character = activeCharacterQuery.data;
  const equippedSkin = character?.equippedSkin ?? null;
  const activeCharacterTypeId = toCharacterTypeId(character?.characterTypeCode);
  const skinItems = (skinsQuery.data?.items ?? []).filter((item) =>
    isVisibleForCharacter(item.characterTypeId, activeCharacterTypeId),
  );
  const characterMood = useMemo(
    () => (character ? toCharacterMood(character.states) : "idle"),
    [character],
  );
  const inventoryError = activeCharacterQuery.isError
    ? activeCharacterQuery.error
    : skinsQuery.isError
      ? skinsQuery.error
      : null;

  const handleEquipSkin = (itemId: number | null, itemName: string) => {
    if (!character) return;

    setPendingTarget(itemId ?? "base");
    equipMutation.mutate(
      {
        characterId: character.id,
        body: { itemId },
      },
      {
        onSuccess: () => {
          showToast(
            itemId === null
              ? "기본 외형으로 돌아왔어요."
              : `${itemName} 장착 완료!`,
          );
        },
        onError: (error) => {
          showToast(getUserFacingErrorMessage(error));
        },
        onSettled: () => {
          setPendingTarget(null);
        },
      },
    );
  };

  if (activeCharacterQuery.isLoading || skinsQuery.isLoading) {
    return <InventoryLoadingPage />;
  }

  if (inventoryError || !character) {
    return (
      <InventoryFrame>
        <div className="inventory-page__state">
          <h2>보관함을 못 불러왔어요.</h2>
          <p>{getUserFacingErrorMessage(inventoryError)}</p>
          <Button
            onClick={() => {
              void activeCharacterQuery.refetch();
              void skinsQuery.refetch();
            }}
          >
            다시 불러오기
          </Button>
        </div>
      </InventoryFrame>
    );
  }

  return (
    <InventoryFrame>
      <div className="inventory-page__body">
        {/* SCR-014 인벤토리: 현재 별친구용 스킨만 보여주고 equippedSkin.itemId로 장착 여부를 계산한다. */}
        <CharacterStage
          bubble={
            equippedSkin
              ? `${equippedSkin.name}을 입고 있어요.`
              : "지금은 기본 외형으로 있어요."
          }
          character={toCharacterKey(character.characterTypeCode)}
          mood={characterMood}
          name={character.name}
          stats={[
            { label: "장착", value: equippedSkin?.name ?? "기본 외형" },
            { label: "보유", value: `${skinItems.length}개` },
          ]}
        />

        <section className="inventory-page__section" aria-labelledby="inventory-skin-title">
          <div className="inventory-page__section-head">
            <div>
              <span className="inventory-page__eyebrow">스킨 보관함</span>
              <h2 id="inventory-skin-title">보유 스킨</h2>
            </div>
            <Tag variant="primary">기본 외형 해제 지원</Tag>
          </div>

          <div className="inventory-page__skin-grid" role="list">
            <BaseSkinCard
              disabled={equipMutation.isPending}
              equipped={equippedSkin === null}
              pending={pendingTarget === "base"}
              onEquip={() => handleEquipSkin(null, "기본 외형")}
            />

            {skinItems.map((item, index) => {
              const equipped = equippedSkin?.itemId === item.itemId;

              return (
                <OwnedSkinCard
                  disabled={equipMutation.isPending}
                  equipped={equipped}
                  index={index}
                  item={item}
                  key={item.userItemId}
                  pending={pendingTarget === item.itemId}
                  onEquip={() => handleEquipSkin(item.itemId, item.name)}
                />
              );
            })}
          </div>

          {skinItems.length === 0 ? (
            <Card className="inventory-page__empty-card">
              <ShoppingBag size={30} strokeWidth={1.7} />
              <strong>아직 아이템이 없어요.</strong>
              <p>상점에서 마음에 드는 스킨을 먼저 골라봐요.</p>
              <Button onClick={() => navigate(routes.shop)} size="compact" variant="secondary">
                <Store size={17} strokeWidth={1.9} />
                상점 가기
              </Button>
            </Card>
          ) : null}
        </section>
      </div>
    </InventoryFrame>
  );
}

function BaseSkinCard({
  disabled,
  equipped,
  pending,
  onEquip,
}: {
  disabled: boolean;
  equipped: boolean;
  pending: boolean;
  onEquip: () => void;
}) {
  return (
    <Card className={`inventory-page__skin-card ${equipped ? "inventory-page__skin-card--equipped" : ""}`} role="listitem">
      <div className="inventory-page__skin-preview inventory-page__skin-preview--base">
        <CircleOff size={30} strokeWidth={1.7} />
      </div>
      <div className="inventory-page__skin-info">
        <div className="inventory-page__skin-title-row">
          <strong>기본 외형</strong>
          {equipped ? <Check size={16} strokeWidth={2.2} /> : null}
        </div>
        <span>스킨을 해제하고 원래 모습으로 돌아가요.</span>
      </div>
      <Button
        className="inventory-page__equip-button"
        disabled={disabled || equipped}
        onClick={onEquip}
        size="compact"
        variant={equipped ? "secondary" : "primary"}
      >
        {pending ? "바꾸는 중..." : equipped ? "장착 중" : "기본으로"}
      </Button>
    </Card>
  );
}

function OwnedSkinCard({
  disabled,
  equipped,
  index,
  item,
  pending,
  onEquip,
}: {
  disabled: boolean;
  equipped: boolean;
  index: number;
  item: UserInventoryItem;
  pending: boolean;
  onEquip: () => void;
}) {
  return (
    <Card className={`inventory-page__skin-card ${equipped ? "inventory-page__skin-card--equipped" : ""}`} role="listitem">
      <div className={`inventory-page__skin-preview inventory-page__skin-preview--${index % 3}`}>
        <img alt="" src={item.imageUrl} />
        <Sparkles size={28} strokeWidth={1.7} />
      </div>
      <div className="inventory-page__skin-info">
        <div className="inventory-page__skin-title-row">
          <strong>{item.name}</strong>
          {equipped ? <Check size={16} strokeWidth={2.2} /> : null}
        </div>
        <span className="inventory-page__skin-meta">
          <Tag variant="neutral">{getSkinScopeLabel(item.characterTypeId)}</Tag>
          {equipped ? "지금 별친구가 입고 있어요." : "선택하면 바로 장착돼요."}
        </span>
      </div>
      <Button
        className="inventory-page__equip-button"
        disabled={disabled || equipped}
        onClick={onEquip}
        size="compact"
        variant={equipped ? "secondary" : "primary"}
      >
        {pending ? "장착 중..." : equipped ? "장착 중" : "장착하기"}
      </Button>
    </Card>
  );
}

function InventoryFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <main className="inventory-page">
      <AppShell>
        <Header
          title="내 보관함"
          onBack={() => navigate(routes.shop)}
          right={
            <Button
              className="inventory-page__shop-button"
              onClick={() => navigate(routes.shop)}
              size="compact"
              variant="ghost"
            >
              <Store size={17} strokeWidth={1.9} />
              상점
            </Button>
          }
        />
        {children}
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}

function InventoryLoadingPage() {
  return (
    <InventoryFrame>
      <div className="inventory-page__body">
        <div className="inventory-page__skeleton inventory-page__skeleton--stage" />
        <div className="inventory-page__skin-grid">
          <div className="inventory-page__skeleton inventory-page__skeleton--item" />
          <div className="inventory-page__skeleton inventory-page__skeleton--item" />
        </div>
      </div>
    </InventoryFrame>
  );
}

function toCharacterMood(states: CharacterStates): CharacterMood {
  if (states.energy.grade === "BAD") return "sleepy";
  if (states.affection.grade === "GOOD") return "happy";
  return "idle";
}

function isVisibleForCharacter(itemCharacterTypeId: number | null, activeCharacterTypeId: number | null) {
  return itemCharacterTypeId === null || itemCharacterTypeId === activeCharacterTypeId;
}

function getSkinScopeLabel(characterTypeId: number | null) {
  return characterTypeId ? `${getCharacterTypeLabelById(characterTypeId)} 전용` : "공용";
}
