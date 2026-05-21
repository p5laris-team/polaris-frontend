import {
  type WalletTransaction,
  type WalletTransactionReason,
  type WalletTransactionsRequest,
  type WalletTransactionsResponse,
} from "./walletTypes";

type DemoWalletTransactionInput = {
  amount: number;
  balanceAfter: number;
  reason: WalletTransactionReason;
  description: string;
  sourceType?: string | null;
  sourceId?: number | null;
};

const todayKey = getTodayDateKey();

let nextWalletTransactionId = 1204;
let demoWalletTransactions: WalletTransaction[] = [
  {
    id: 1203,
    amount: 10,
    balanceAfter: 240,
    reason: "ATTENDANCE_REWARD",
    description: "오늘 출석 보상",
    sourceType: "ATTENDANCE",
    sourceId: 302,
    occurredAt: toTodayIsoTime("10:50"),
  },
  {
    id: 1202,
    amount: 10,
    balanceAfter: 230,
    reason: "MISSION_REWARD",
    description: "햇빛 한 번 보기 완료",
    sourceType: "MISSION",
    sourceId: 102,
    occurredAt: toTodayIsoTime("10:12"),
  },
  {
    id: 1201,
    amount: 10,
    balanceAfter: 220,
    reason: "MISSION_REWARD",
    description: "물 한 컵 마시기 완료",
    sourceType: "MISSION",
    sourceId: 101,
    occurredAt: toTodayIsoTime("09:15"),
  },
];

export function demoGetWalletTransactions({
  size,
}: WalletTransactionsRequest): WalletTransactionsResponse {
  const items = [...demoWalletTransactions]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, size);

  return {
    items,
    pageInfo: {
      nextCursor: null,
      hasNext: false,
      size,
    },
  };
}

export function demoRecordWalletTransaction({
  amount,
  balanceAfter,
  reason,
  description,
  sourceType = null,
  sourceId = null,
}: DemoWalletTransactionInput) {
  // 별조각 fixture 거래내역은 지갑 숫자를 바꾸는 순간 함께 쌓아 화면 간 흐름을 맞춘다.
  const transaction: WalletTransaction = {
    id: nextWalletTransactionId++,
    amount,
    balanceAfter,
    reason,
    description,
    sourceType,
    sourceId,
    occurredAt: new Date().toISOString(),
  };

  demoWalletTransactions = [transaction, ...demoWalletTransactions];

  return transaction;
}

function getTodayDateKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

function toTodayIsoTime(time: string) {
  return `${todayKey}T${time}:00+09:00`;
}
