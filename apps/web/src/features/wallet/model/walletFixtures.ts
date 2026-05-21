import { getDemoWalletStarPiece } from "@/features/home/model/homeFixture";
import { demoGetWalletTransactions } from "@/features/wallet/model/walletLedger";

import {
  type WalletSummaryResponse,
  type WalletTransactionsRequest,
  type WalletTransactionsResponse,
} from "./walletTypes";

export function demoGetWalletSummary(): WalletSummaryResponse {
  return {
    starPiece: getDemoWalletStarPiece(),
    updatedAt: new Date().toISOString(),
  };
}

export function demoGetWalletTransactionList(
  params: WalletTransactionsRequest,
): WalletTransactionsResponse {
  return demoGetWalletTransactions(params);
}
