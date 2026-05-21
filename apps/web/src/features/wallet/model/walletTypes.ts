import { type CursorPage } from "@/shared/api";

export type WalletTransactionReason =
  | "MISSION_REWARD"
  | "ATTENDANCE_REWARD"
  | "SHARE_REWARD"
  | "ITEM_PURCHASE"
  | "CARE_ACTION";

export type WalletSummaryResponse = {
  starPiece: number;
  updatedAt: string;
};

export type WalletTransaction = {
  id: number;
  amount: number;
  balanceAfter: number;
  reason: WalletTransactionReason;
  description: string;
  sourceType: string | null;
  sourceId: number | null;
  occurredAt: string;
};

export type WalletTransactionsRequest = {
  cursor?: string | null;
  size: number;
};

export type WalletTransactionsResponse = CursorPage<WalletTransaction>;
