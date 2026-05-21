import { type ReactNode, useState } from "react";
import {
  Archive,
  Check,
  Gamepad2,
  Minus,
  Moon,
  PackagePlus,
  Plus,
  ShoppingBag,
  Sparkles,
  Utensils,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getCharacterTypeLabelById,
  toCharacterTypeId,
} from "@/entities/character/types";
import { resolveItemImageUrl } from "@/features/item/model/itemAssetResolver";
import {
  usePurchaseShopItemMutation,
  useShopConsumableItemsQuery,
  useShopSkinItemsQuery,
} from "@/features/shop/api/shopApi";
import {
  type ShopItem,
  type ShopItemEffectType,
  type ShopItemType,
} from "@/features/shop/model/shopTypes";
import { useHomeQuery } from "@/features/home/api/homeApi";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { AppShell, Button, Card, Header, Modal, Tag, useToast } from "@/shared/ui";

import "./ShopPage.css";

const shopCategories: Array<{
  type: ShopItemType;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    type: "SKIN",
    label: "스킨",
    description: "외형 꾸미기",
    icon: Sparkles,
  },
  {
    type: "CONSUMABLE",
    label: "돌봄 소모품",
    description: "밥/휴식/놀이",
    icon: PackagePlus,
  },
];

export function ShopPage() {
  const { showToast } = useToast();
  const homeQuery = useHomeQuery();
  const skinsQuery = useShopSkinItemsQuery();
  const consumablesQuery = useShopConsumableItemsQuery();
  const purchaseMutation = usePurchaseShopItemMutation();
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [activeCategory, setActiveCategory] = useState<ShopItemType>("SKIN");

  const walletStarPiece = homeQuery.data?.wallet.starPiece ?? 0;
  const shopError = homeQuery.isError
    ? homeQuery.error
    : skinsQuery.isError
      ? skinsQuery.error
      : consumablesQuery.isError
        ? consumablesQuery.error
        : null;
  const purchaseTotalPrice = selectedItem ? selectedItem.price * selectedQuantity : 0;
  const purchaseAfterBalance = selectedItem
    ? walletStarPiece - purchaseTotalPrice
    : walletStarPiece;
  const canPurchaseSelected = Boolean(
    selectedItem &&
      (selectedItem.itemType === "CONSUMABLE" || !selectedItem.owned) &&
      purchaseAfterBalance >= 0,
  );

  const handleRetry = () => {
    void homeQuery.refetch();
    void skinsQuery.refetch();
    void consumablesQuery.refetch();
  };

  const handleSelectItem = (item: ShopItem) => {
    setSelectedItem(item);
    setSelectedQuantity(1);
  };

  const handleCategorySelect = (category: ShopItemType) => {
    setActiveCategory(category);
    window.requestAnimationFrame(() => {
      document.querySelector(".shop-page__category-tabs")?.scrollIntoView({ block: "start" });
    });
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem || !canPurchaseSelected) return;

    purchaseMutation.mutate(
      {
        itemId: selectedItem.id,
        quantity: selectedQuantity,
      },
      {
        onSuccess: (purchase) => {
          setSelectedItem(null);
          setSelectedQuantity(1);
          showToast(
            selectedItem.itemType === "CONSUMABLE"
              ? `${purchase.name} ${purchase.quantity}개 구매 완료! 돌봄에서 바로 쓸 수 있어요.`
              : `${purchase.name} 구매 완료! 보관함에서 장착해보세요.`,
          );
        },
        onError: (error) => {
          showToast(getUserFacingErrorMessage(error));
        },
      },
    );
  };

  if (homeQuery.isLoading || skinsQuery.isLoading || consumablesQuery.isLoading) {
    return <ShopLoadingPage />;
  }

  if (shopError) {
    return (
      <ShopFrame>
        <div className="shop-page__state">
          <h2>상점 문을 잠깐 못 열었어요.</h2>
          <p>{getUserFacingErrorMessage(shopError)}</p>
          <Button onClick={handleRetry}>다시 불러오기</Button>
        </div>
      </ShopFrame>
    );
  }

  const activeCharacterTypeId = toCharacterTypeId(homeQuery.data?.character.characterTypeCode);
  const skinItems = (skinsQuery.data?.items ?? []).filter((item) =>
    isVisibleForCharacter(item.characterTypeId, activeCharacterTypeId),
  );
  const consumableItems = consumablesQuery.data?.items ?? [];

  return (
    <ShopFrame>
      <div className="shop-page__body">
        {/* SCR-013 스킨 상점: 현재 캐릭터 characterTypeId에 맞는 스킨만 보여주고 클라이언트에서 보유 상태를 계산한다. */}
        <Card className="shop-page__wallet-card">
          <div className="shop-page__wallet-copy">
            <span className="shop-page__eyebrow">보유 별조각</span>
            <strong>✦ {walletStarPiece}</strong>
          </div>
          <div className="shop-page__wallet-icon" aria-hidden="true">
            <WalletCards size={28} strokeWidth={1.8} />
          </div>
        </Card>

        <div className="shop-page__category-tabs" role="tablist" aria-label="상점 카테고리">
          {shopCategories.map((category) => {
            const Icon = category.icon;
            const active = activeCategory === category.type;

            return (
              <button
                aria-selected={active}
                className={active ? "shop-page__category-tab is-active" : "shop-page__category-tab"}
                key={category.type}
                onClick={() => handleCategorySelect(category.type)}
                role="tab"
                type="button"
              >
                <Icon size={17} strokeWidth={1.9} />
                <span>
                  <strong>{category.label}</strong>
                  <small>{category.description}</small>
                </span>
              </button>
            );
          })}
        </div>

        {/* SCR-013 상점: 카테고리 탭으로 긴 스크롤 없이 스킨/소모품 구매 흐름을 전환한다. */}
        {activeCategory === "SKIN" ? (
          <section className="shop-page__section" aria-labelledby="skin-shop-title" role="tabpanel">
            <div className="shop-page__section-head">
              <div>
                <span className="shop-page__eyebrow">스킨 꾸미기</span>
                <h2 id="skin-shop-title">별친구 스킨</h2>
              </div>
              <Tag variant="primary">스킨 상점</Tag>
            </div>

            <div className="shop-page__skin-grid" role="list">
              {skinItems.map((item, index) => {
                const cantAfford = walletStarPiece < item.price;
                const imageUrl = resolveItemImageUrl(item);

                return (
                  <Card className="shop-page__skin-card" key={item.id} role="listitem">
                    <div className={`shop-page__skin-preview shop-page__skin-preview--${index % 3}`}>
                      <img alt="" src={imageUrl} />
                    </div>

                    <div className="shop-page__skin-info">
                      <div className="shop-page__skin-title-row">
                        <strong>{item.name}</strong>
                        <span className="shop-page__skin-badges">
                          <Tag variant="neutral">{getSkinScopeLabel(item.characterTypeId)}</Tag>
                          {item.owned ? <Check size={16} strokeWidth={2.2} /> : null}
                        </span>
                      </div>
                    </div>

                    <div className="shop-page__skin-footer">
                      <span className={cantAfford && !item.owned ? "shop-page__price--danger" : ""}>
                        ✦ {item.price}
                      </span>
                      <Button
                        disabled={item.owned}
                        onClick={() => handleSelectItem(item)}
                        size="compact"
                        variant={item.owned ? "secondary" : cantAfford ? "secondary" : "primary"}
                      >
                        {item.owned ? "보유 중" : cantAfford ? "별조각 부족" : "구매"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {skinItems.length === 0 ? (
              <Card className="shop-page__empty-card">
                <ShoppingBag size={30} strokeWidth={1.7} />
                <strong>판매 중인 스킨이 아직 없어요.</strong>
                <p>새 스킨이 준비되면 이곳에 먼저 놓아둘게요.</p>
              </Card>
            ) : null}
          </section>
        ) : (
          <section
            className="shop-page__section"
            aria-labelledby="consumable-shop-title"
            role="tabpanel"
          >
            <div className="shop-page__section-head">
              <div>
                <span className="shop-page__eyebrow">돌봄 소모품</span>
                <h2 id="consumable-shop-title">아이템 채우기</h2>
              </div>
              <Tag variant="neutral">반복 구매</Tag>
            </div>

            <div className="shop-page__consumable-list" role="list">
              {consumableItems.map((item) => {
                const cantAfford = walletStarPiece < item.price;
                const effectClassName = getConsumableEffectClassName(item.effectType, item.name);
                const { label } = getConsumableMeta(item.effectType, item.name);
                const imageUrl = resolveItemImageUrl(item);

                return (
                  <Card className="shop-page__consumable-card" key={item.id} role="listitem">
                    <span
                      className={`shop-page__consumable-icon shop-page__consumable-icon--${effectClassName}`}
                      aria-hidden="true"
                    >
                      <img alt="" src={imageUrl} />
                    </span>
                    <div className="shop-page__consumable-info">
                      <strong>{item.name}</strong>
                      <span>{label}</span>
                    </div>
                    <div className="shop-page__consumable-buy">
                      <strong className={cantAfford ? "shop-page__price--danger" : ""}>
                        ✦ {item.price}
                      </strong>
                      <Button
                        onClick={() => handleSelectItem(item)}
                        size="compact"
                        variant={cantAfford ? "secondary" : "primary"}
                      >
                        <PackagePlus size={16} strokeWidth={1.9} />
                        구매
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {consumableItems.length === 0 ? (
              <Card className="shop-page__empty-card">
                <ShoppingBag size={30} strokeWidth={1.7} />
                <strong>판매 중인 돌봄 아이템이 없어요.</strong>
                <p>아이템이 추가되면 이곳에서 수량을 채울 수 있어요.</p>
              </Card>
            ) : null}
          </section>
        )}
      </div>

      <PurchaseConfirmModal
        afterBalance={purchaseAfterBalance}
        canPurchase={canPurchaseSelected}
        item={selectedItem}
        loading={purchaseMutation.isPending}
        quantity={selectedQuantity}
        totalPrice={purchaseTotalPrice}
        walletStarPiece={walletStarPiece}
        onCancel={() => {
          setSelectedItem(null);
          setSelectedQuantity(1);
        }}
        onConfirm={handleConfirmPurchase}
        onQuantityChange={setSelectedQuantity}
      />
    </ShopFrame>
  );
}

function ShopFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <main className="shop-page">
      <AppShell>
        <Header
          title="상점"
          onBack={() => navigate(routes.home)}
          right={
            <Button
              className="shop-page__inventory-button"
              onClick={() => navigate(routes.inventory)}
              size="compact"
              variant="ghost"
            >
              <Archive size={17} strokeWidth={1.9} />
              보관함
            </Button>
          }
        />
        {children}
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}

function PurchaseConfirmModal({
  afterBalance,
  canPurchase,
  item,
  loading,
  quantity,
  totalPrice,
  walletStarPiece,
  onCancel,
  onConfirm,
  onQuantityChange,
}: {
  afterBalance: number;
  canPurchase: boolean;
  item: ShopItem | null;
  loading: boolean;
  quantity: number;
  totalPrice: number;
  walletStarPiece: number;
  onCancel: () => void;
  onConfirm: () => void;
  onQuantityChange: (quantity: number) => void;
}) {
  if (!item) return null;

  const isConsumable = item.itemType === "CONSUMABLE";
  const imageUrl = resolveItemImageUrl(item);
  const effectClassName = isConsumable
    ? getConsumableEffectClassName(item.effectType, item.name)
    : null;

  return (
    <Modal
      cancelText="취소"
      confirmDisabled={!canPurchase || loading}
      confirmText={loading ? "구매 중..." : "구매하기"}
      onCancel={onCancel}
      onConfirm={onConfirm}
      open={Boolean(item)}
      title={isConsumable ? "소모품 구매" : "스킨 구매"}
    >
      <div className="shop-page__purchase-modal">
        <div
          className={`shop-page__purchase-preview${
            isConsumable ? " shop-page__purchase-preview--consumable" : ""
          }${
            effectClassName ? ` shop-page__purchase-preview--${effectClassName}` : ""
          }`}
        >
          <img alt="" src={imageUrl} />
        </div>
        <strong>{item.name}</strong>
        <p>
          {isConsumable
            ? "구매한 소모품은 돌봄 활동에서 1개씩 사용돼요."
            : "구매한 스킨은 보관함에서 별친구에게 장착할 수 있어요."}
        </p>
        {isConsumable ? (
          <div className="shop-page__quantity-control" aria-label="구매 수량 선택">
            <button
              disabled={quantity <= 1 || loading}
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              type="button"
            >
              <Minus size={16} strokeWidth={2} />
            </button>
            <strong>{quantity}개</strong>
            <button
              disabled={quantity >= 9 || loading}
              onClick={() => onQuantityChange(Math.min(9, quantity + 1))}
              type="button"
            >
              <Plus size={16} strokeWidth={2} />
            </button>
          </div>
        ) : null}
        <div className="shop-page__purchase-balance">
          <span>현재 별조각</span>
          <strong>✦ {walletStarPiece}</strong>
          <span>총 가격</span>
          <strong className={afterBalance < 0 ? "shop-page__price--danger" : ""}>
            ✦ {totalPrice}
          </strong>
          <span>구매 후</span>
          <strong className={afterBalance < 0 ? "shop-page__price--danger" : ""}>
            ✦ {Math.max(afterBalance, 0)}
          </strong>
        </div>
        {afterBalance < 0 ? (
          <p className="shop-page__purchase-error">
            별조각이 부족해요. 미션이나 출석으로 조금 더 모아봐요.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

function ShopLoadingPage() {
  return (
    <ShopFrame>
      <div className="shop-page__body">
        <div className="shop-page__skeleton shop-page__skeleton--wallet" />
        <div className="shop-page__skin-grid">
          <div className="shop-page__skeleton shop-page__skeleton--item" />
          <div className="shop-page__skeleton shop-page__skeleton--item" />
        </div>
      </div>
    </ShopFrame>
  );
}

function isVisibleForCharacter(
  itemCharacterTypeId: number | null | undefined,
  activeCharacterTypeId: number | null,
) {
  return (
    itemCharacterTypeId === undefined ||
    itemCharacterTypeId === null ||
    itemCharacterTypeId === 0 ||
    itemCharacterTypeId === activeCharacterTypeId
  );
}

function getSkinScopeLabel(characterTypeId: number | null | undefined) {
  return characterTypeId ? `${getCharacterTypeLabelById(characterTypeId)} 전용` : "공용";
}

function getConsumableMeta(
  effectType: ShopItemEffectType | null | undefined,
  name: string,
): { Icon: LucideIcon; label: string } {
  const inferredEffectType = effectType ?? inferEffectTypeFromName(name);

  if (inferredEffectType === "FOOD") {
    return { Icon: Utensils, label: "포만감 회복" };
  }

  if (inferredEffectType === "REST") {
    return { Icon: Moon, label: "기운 회복" };
  }

  return { Icon: Gamepad2, label: "애정 회복" };
}

function getConsumableEffectClassName(
  effectType: ShopItemEffectType | null | undefined,
  name: string,
) {
  return (effectType ?? inferEffectTypeFromName(name)).toLowerCase();
}

function inferEffectTypeFromName(name: string): ShopItemEffectType {
  if (name.includes("밥") || name.includes("먹")) return "FOOD";
  if (name.includes("베개") || name.includes("잠") || name.includes("구름")) return "REST";

  return "PLAY";
}
