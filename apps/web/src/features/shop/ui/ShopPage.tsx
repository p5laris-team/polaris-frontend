import { type ReactNode, useState } from "react";
import { Archive, Check, ShoppingBag, Sparkles, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  usePurchaseShopItemMutation,
  useShopSkinItemsQuery,
} from "@/features/shop/api/shopApi";
import { type ShopItem } from "@/features/shop/model/shopTypes";
import { useHomeQuery } from "@/features/home/api/homeApi";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { AppShell, Button, Card, Header, Modal, Tag, useToast } from "@/shared/ui";

import "./ShopPage.css";

export function ShopPage() {
  const { showToast } = useToast();
  const homeQuery = useHomeQuery();
  const skinsQuery = useShopSkinItemsQuery();
  const purchaseMutation = usePurchaseShopItemMutation();
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  const walletStarPiece = homeQuery.data?.wallet.starPiece ?? 0;
  const shopError = homeQuery.isError ? homeQuery.error : skinsQuery.isError ? skinsQuery.error : null;
  const purchaseAfterBalance = selectedItem ? walletStarPiece - selectedItem.price : walletStarPiece;
  const canPurchaseSelected = Boolean(
    selectedItem && !selectedItem.owned && purchaseAfterBalance >= 0,
  );

  const handleRetry = () => {
    void homeQuery.refetch();
    void skinsQuery.refetch();
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem || !canPurchaseSelected) return;

    purchaseMutation.mutate(
      {
        itemId: selectedItem.id,
        quantity: 1,
      },
      {
        onSuccess: (purchase) => {
          setSelectedItem(null);
          showToast(`${purchase.name} 구매 완료! 보관함에서 장착해보세요.`);
        },
        onError: (error) => {
          showToast(getUserFacingErrorMessage(error));
        },
      },
    );
  };

  if (homeQuery.isLoading || skinsQuery.isLoading) {
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

  const skinItems = skinsQuery.data?.items ?? [];

  return (
    <ShopFrame>
      <div className="shop-page__body">
        {/* SCR-013 스킨 상점: API의 owned 값과 홈 지갑 잔액으로 구매 가능 상태를 계산한다. */}
        <Card className="shop-page__wallet-card">
          <div className="shop-page__wallet-copy">
            <span className="shop-page__eyebrow">보유 별조각</span>
            <strong>✦ {walletStarPiece}</strong>
            <p>마음에 드는 스킨을 골라 별친구의 분위기를 바꿔봐요.</p>
          </div>
          <div className="shop-page__wallet-icon" aria-hidden="true">
            <WalletCards size={28} strokeWidth={1.8} />
          </div>
        </Card>

        <section className="shop-page__section" aria-labelledby="skin-shop-title">
          <div className="shop-page__section-head">
            <div>
              <span className="shop-page__eyebrow">스킨 꾸미기</span>
              <h2 id="skin-shop-title">별친구 스킨</h2>
            </div>
            <Tag variant="primary">MVP 스킨 전용</Tag>
          </div>

          <div className="shop-page__skin-grid" role="list">
            {skinItems.map((item, index) => {
              const cantAfford = walletStarPiece < item.price;

              return (
                <Card className="shop-page__skin-card" key={item.id} role="listitem">
                  <div className={`shop-page__skin-preview shop-page__skin-preview--${index % 3}`}>
                    <img alt="" src={item.imageUrl} />
                    <Sparkles size={26} strokeWidth={1.7} />
                  </div>

                  <div className="shop-page__skin-info">
                    <div className="shop-page__skin-title-row">
                      <strong>{item.name}</strong>
                      {item.owned ? <Check size={16} strokeWidth={2.2} /> : null}
                    </div>
                    <span>구매 후 보관함에서 장착할 수 있어요.</span>
                  </div>

                  <div className="shop-page__skin-footer">
                    <span className={cantAfford && !item.owned ? "shop-page__price--danger" : ""}>
                      ✦ {item.price}
                    </span>
                    <Button
                      disabled={item.owned}
                      onClick={() => setSelectedItem(item)}
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

        <Card className="shop-page__notice-card">
          <strong>스킨만 실제 구매 정책으로 다뤄요.</strong>
          <p>소모품과 액세서리는 이번 MVP 상점 범위에서 제외하고, 보관함 장착 흐름은 다음 PR에서 이어갑니다.</p>
        </Card>
      </div>

      <PurchaseConfirmModal
        afterBalance={purchaseAfterBalance}
        canPurchase={canPurchaseSelected}
        item={selectedItem}
        loading={purchaseMutation.isPending}
        walletStarPiece={walletStarPiece}
        onCancel={() => setSelectedItem(null)}
        onConfirm={handleConfirmPurchase}
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
  walletStarPiece,
  onCancel,
  onConfirm,
}: {
  afterBalance: number;
  canPurchase: boolean;
  item: ShopItem | null;
  loading: boolean;
  walletStarPiece: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!item) return null;

  return (
    <Modal
      cancelText="취소"
      confirmDisabled={!canPurchase || loading}
      confirmText={loading ? "구매 중..." : "구매하기"}
      onCancel={onCancel}
      onConfirm={onConfirm}
      open={Boolean(item)}
      title="스킨 구매"
    >
      <div className="shop-page__purchase-modal">
        <div className="shop-page__purchase-preview">
          <img alt="" src={item.imageUrl} />
          <Sparkles size={28} strokeWidth={1.7} />
        </div>
        <strong>{item.name}</strong>
        <p>구매한 스킨은 보관함에서 별친구에게 장착할 수 있어요.</p>
        <div className="shop-page__purchase-balance">
          <span>현재 별조각</span>
          <strong>✦ {walletStarPiece}</strong>
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
