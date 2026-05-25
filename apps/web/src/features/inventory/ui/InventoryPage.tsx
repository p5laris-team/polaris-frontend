/**
 * 보관함 화면입니다.
 * 사용자가 구매한 스킨을 현재 별친구 기준으로 필터링하고,
 * 장착/해제 mutation을 통해 캐릭터 외형을 바꿉니다.
 */
import { type ReactNode, useMemo, useState } from "react";
import { Check, CircleOff, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getCharacterTypeLabelById,
  toCharacterKey,
  toCharacterTypeId,
  type CharacterKey,
  type CharacterStates,
} from "@/entities/character/types";
import { useActiveCharacterQuery } from "@/features/character/api/characterCareApi";
import { resolveCharacterImageUrl } from "@/features/character/model/characterAssetResolver";
import { resolveItemImageUrl } from "@/features/item/model/itemAssetResolver";
import {
  useInventorySkinItemsQuery,
  useUpdateEquippedSkinMutation,
} from "@/features/inventory/api/inventoryApi";
import {
  getInventoryBaseSkinDescription,
  getInventoryEmptyState,
  getInventoryEquipSuccessMessage,
  getInventorySkinMeta,
  getInventoryStageBubble,
} from "@/features/inventory/model/inventoryMessages";
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
import { emptyStateAssets, type CharacterMood } from "@/shared/assets/polarisAssets";

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
    () => toCharacterMood(character?.states),
    [character],
  );
  const characterKey = toCharacterKey(character?.characterTypeCode);
  const inventoryEmptyState = getInventoryEmptyState(characterKey);
  const characterImageUrl = character
    ? resolveCharacterImageUrl({
        character: characterKey,
        mood: characterMood,
        states: character.states,
        equippedSkin,
        assetUrls: character.assetUrls,
        fallbackUrl: character.currentAssetUrl,
      })
    : undefined;
  const inventoryError = activeCharacterQuery.isError
    ? activeCharacterQuery.error
    : skinsQuery.isError
      ? skinsQuery.error
      : null;

  /** 스킨 itemId를 넘기면 장착, null을 넘기면 기본 외형으로 되돌립니다. */
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
          showToast(getInventoryEquipSuccessMessage(characterKey, itemId === null ? null : itemName));
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
          bubble={getInventoryStageBubble(characterKey, equippedSkin?.name)}
          character={characterKey}
          imageUrl={characterImageUrl}
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
              characterKey={characterKey}
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
                  characterKey={characterKey}
                  onEquip={() => handleEquipSkin(item.itemId, item.name)}
                />
              );
            })}
          </div>

          {skinItems.length === 0 ? (
            <Card className="inventory-page__empty-card">
              <img
                alt=""
                className="inventory-page__empty-illustration"
                src={emptyStateAssets.inventory}
              />
              <strong>{inventoryEmptyState.title}</strong>
              <p>{inventoryEmptyState.description}</p>
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

/** 기본 외형으로 되돌리는 선택지를 스킨 목록의 첫 번째 카드로 제공합니다. */
function BaseSkinCard({
  characterKey,
  disabled,
  equipped,
  pending,
  onEquip,
}: {
  characterKey: CharacterKey;
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
        <span>{getInventoryBaseSkinDescription(characterKey)}</span>
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

/** 사용자가 보유한 단일 스킨 카드입니다. 장착 중/장착 가능 상태를 버튼 문구로 보여줍니다. */
function OwnedSkinCard({
  characterKey,
  disabled,
  equipped,
  index,
  item,
  pending,
  onEquip,
}: {
  characterKey: CharacterKey;
  disabled: boolean;
  equipped: boolean;
  index: number;
  item: UserInventoryItem;
  pending: boolean;
  onEquip: () => void;
}) {
  const imageUrl = resolveItemImageUrl(item);

  return (
    <Card className={`inventory-page__skin-card ${equipped ? "inventory-page__skin-card--equipped" : ""}`} role="listitem">
      <div className={`inventory-page__skin-preview inventory-page__skin-preview--${index % 3}`}>
        <img alt="" src={imageUrl} />
      </div>
      <div className="inventory-page__skin-info">
        <div className="inventory-page__skin-title-row">
          <strong>{item.name}</strong>
          {equipped ? <Check size={16} strokeWidth={2.2} /> : null}
        </div>
        <span className="inventory-page__skin-meta">
          <Tag variant="neutral">{getSkinScopeLabel(item.characterTypeId)}</Tag>
          {getInventorySkinMeta(characterKey, equipped)}
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

/** 보관함 헤더, 상점 바로가기, 하단 탭을 묶는 화면 프레임입니다. */
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

/** 캐릭터와 스킨 목록을 불러오는 동안 표시하는 skeleton 화면입니다. */
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

/** 캐릭터 상태 등급을 보관함 미리보기에서 쓸 대표 표정으로 변환합니다. */
function toCharacterMood(states?: CharacterStates): CharacterMood {
  if (!states) return "idle";
  if (states.energy?.grade === "BAD") return "sleepy";
  if (states.affection?.grade === "GOOD") return "happy";
  return "idle";
}

/** 현재 캐릭터에게 적용 가능한 공용/전용 스킨만 남깁니다. */
function isVisibleForCharacter(itemCharacterTypeId: number | null, activeCharacterTypeId: number | null) {
  return (
    itemCharacterTypeId === null ||
    itemCharacterTypeId === 0 ||
    itemCharacterTypeId === activeCharacterTypeId
  );
}

/** 스킨 적용 범위를 공용 또는 캐릭터 전용 라벨로 표시합니다. */
function getSkinScopeLabel(characterTypeId: number | null) {
  return characterTypeId ? `${getCharacterTypeLabelById(characterTypeId)} 전용` : "공용";
}
