/**
 * 별조각 지갑 화면입니다.
 * 현재 잔액과 최근 거래내역을 보여주고, 미션/출석/공유/상점 같은 거래 사유를 사람이 읽는 라벨로 바꿉니다.
 */
import { type ReactNode, useMemo } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarCheck,
  HeartHandshake,
  ShoppingBag,
  Sparkles,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  useWalletSummaryQuery,
  useWalletTransactionsQuery,
} from "@/features/wallet/api/walletApi";
import {
  type WalletTransaction,
  type WalletTransactionReason,
} from "@/features/wallet/model/walletTypes";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { emptyStateAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, Card, ErrorState, Header, StarPieceAmount, Tag } from "@/shared/ui";

import "./WalletPage.css";

export function WalletPage() {
  const walletQuery = useWalletSummaryQuery();
  const transactionsQuery = useWalletTransactionsQuery();
  const walletError = walletQuery.error ?? transactionsQuery.error ?? null;
  const transactions = transactionsQuery.data?.items ?? [];
  const summary = useMemo(() => getTransactionSummary(transactions), [transactions]);

  if (walletQuery.isLoading || transactionsQuery.isLoading) {
    return <WalletLoadingPage />;
  }

  if (walletError || !walletQuery.data || !transactionsQuery.data) {
    return (
      <WalletFrame>
        <ErrorState
          className="wallet-page__state"
          description={getUserFacingErrorMessage(walletError)}
          imageSrc={emptyStateAssets.mission}
          onAction={() => {
            void walletQuery.refetch();
            void transactionsQuery.refetch();
          }}
          title="별조각 내역을 불러오지 못했어요."
        />
      </WalletFrame>
    );
  }

  return (
    <WalletFrame>
      <div className="wallet-page__body">
        {/* SCR-015 별조각 내역: 지갑 잔액과 획득/사용 거래를 한 화면에서 확인한다. */}
        <Card className="wallet-page__balance-card">
          <div className="wallet-page__balance-copy">
            <span className="wallet-page__eyebrow">보유 별조각</span>
            <StarPieceAmount
              amount={walletQuery.data.starPiece}
              className="wallet-page__balance-amount"
              size="lg"
            />
            {/*<p>미션, 출석, 공유, 스킨 구매 흐름을 한 곳에서 확인해요.</p>*/}
          </div>
        </Card>

        <div className="wallet-page__summary-grid" aria-label="최근 거래 요약">
          <SummaryCard
            icon={<ArrowDownCircle size={19} strokeWidth={1.8} />}
            label="획득"
            amount={summary.earned}
            prefix="+"
            tone="earn"
          />
          <SummaryCard
            icon={<ArrowUpCircle size={19} strokeWidth={1.8} />}
            label="사용"
            amount={summary.spent}
            prefix={summary.spent > 0 ? "-" : ""}
            tone="spend"
          />
        </div>

        <section className="wallet-page__section" aria-labelledby="wallet-transactions-title">
          <div className="wallet-page__section-head">
            <div>
              {/*<span className="wallet-page__eyebrow">거래내역</span>*/}
              <h2 id="wallet-transactions-title">최근 별조각 흐름</h2>
            </div>
            {/*<Tag variant="primary">{transactions.length}건</Tag>*/}
          </div>

          {transactions.length > 0 ? (
            <ol className="wallet-page__list" aria-label="별조각 거래내역">
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </ol>
          ) : (
            <Card className="wallet-page__empty-card">
              <Sparkles size={32} strokeWidth={1.7} />
              <strong>아직 별조각 흐름이 없어요.</strong>
              <p>미션을 완료하거나 스킨을 구매하면 이곳에 차곡차곡 쌓여요.</p>
            </Card>
          )}
        </section>
      </div>
    </WalletFrame>
  );
}

/** 최근 거래내역에서 획득/사용 합계를 보여주는 작은 요약 카드입니다. */
function SummaryCard({
  amount,
  icon,
  label,
  prefix,
  tone,
}: {
  amount: number;
  icon: ReactNode;
  label: string;
  prefix?: string;
  tone: "earn" | "spend";
}) {
  return (
    <Card className={`wallet-page__summary-card wallet-page__summary-card--${tone}`}>
      {icon}
      <span>{label}</span>
      <StarPieceAmount
        amount={amount}
        className="wallet-page__summary-amount"
        prefix={prefix}
        size="sm"
        tone={tone === "earn" ? "success" : "muted"}
      />
    </Card>
  );
}

/** 지갑 거래내역 한 줄을 렌더링합니다. 거래 후 잔액까지 같이 보여줘 정합성을 확인하기 쉽게 합니다. */
function TransactionItem({ transaction }: { transaction: WalletTransaction }) {
  const meta = getReasonMeta(transaction.reason);
  const amountTone = transaction.amount >= 0 ? "earn" : "spend";

  return (
    <li>
      <Card className="wallet-page__transaction-card">
        <span className={`wallet-page__transaction-icon wallet-page__transaction-icon--${meta.tone}`}>
          {meta.icon}
        </span>
        <span className="wallet-page__transaction-copy">
          <span className="wallet-page__transaction-head">
            <strong>{transaction.description}</strong>
            <Tag variant={transaction.amount >= 0 ? "accent" : "neutral"}>{meta.label}</Tag>
          </span>
          <small>{formatTransactionTime(transaction.occurredAt)}</small>
          <em>
            거래 후
            <StarPieceAmount
              amount={transaction.balanceAfter}
              className="wallet-page__balance-after"
              size="xs"
            />
          </em>
        </span>
        <StarPieceAmount
          amount={transaction.amount}
          className={`wallet-page__amount wallet-page__amount--${amountTone}`}
          prefix={transaction.amount >= 0 ? "+" : "-"}
          size="sm"
          tone={amountTone === "earn" ? "success" : "muted"}
        />
      </Card>
    </li>
  );
}

/** 지갑 화면의 헤더, 하단 탭, 모바일 shell을 묶습니다. */
function WalletFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <main className="wallet-page">
      <AppShell>
        <Header title="별조각" onBack={() => navigate(routes.home)} />
        {children}
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}

/** 지갑 요약과 거래내역을 불러오는 동안 표시하는 skeleton 화면입니다. */
function WalletLoadingPage() {
  return (
    <WalletFrame>
      <div className="wallet-page__body">
        <div className="wallet-page__skeleton wallet-page__skeleton--balance" />
        <div className="wallet-page__summary-grid">
          <div className="wallet-page__skeleton wallet-page__skeleton--summary" />
          <div className="wallet-page__skeleton wallet-page__skeleton--summary" />
        </div>
        <div className="wallet-page__skeleton wallet-page__skeleton--item" />
        <div className="wallet-page__skeleton wallet-page__skeleton--item" />
        <div className="wallet-page__skeleton wallet-page__skeleton--item" />
      </div>
    </WalletFrame>
  );
}

/** 최근 거래 목록을 획득 합계와 사용 합계로 접어 요약합니다. */
function getTransactionSummary(transactions: WalletTransaction[]) {
  return transactions.reduce(
    (summary, transaction) => {
      if (transaction.amount >= 0) {
        return {
          ...summary,
          earned: summary.earned + transaction.amount,
        };
      }

      return {
        ...summary,
        spent: summary.spent + Math.abs(transaction.amount),
      };
    },
    { earned: 0, spent: 0 },
  );
}

/** 백엔드 거래 사유 enum을 화면 아이콘, 라벨, 색상 톤으로 변환합니다. */
function getReasonMeta(reason: WalletTransactionReason): {
  icon: ReactNode;
  label: string;
  tone: string;
} {
  if (reason === "MISSION_REWARD") {
    return {
      icon: <Target size={20} strokeWidth={1.8} />,
      label: "미션",
      tone: "mission",
    };
  }

  if (reason === "ATTENDANCE_REWARD") {
    return {
      icon: <CalendarCheck size={20} strokeWidth={1.8} />,
      label: "출석",
      tone: "attendance",
    };
  }

  if (reason === "SHARE_REWARD") {
    return {
      icon: <Sparkles size={20} strokeWidth={1.8} />,
      label: "공유",
      tone: "share",
    };
  }

  if (reason === "ITEM_PURCHASE") {
    return {
      icon: <ShoppingBag size={20} strokeWidth={1.8} />,
      label: "상점",
      tone: "shop",
    };
  }

  return {
    icon: <HeartHandshake size={20} strokeWidth={1.8} />,
    label: "돌봄",
    tone: "care",
  };
}

/** 거래 발생 시각을 한국어 날짜/시간 라벨로 바꿉니다. */
function formatTransactionTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
