import { useQuery } from "@tanstack/react-query";

import {
  demoGetWalletSummary,
  demoGetWalletTransactionList,
} from "@/features/wallet/model/walletFixtures";
import {
  type WalletSummaryResponse,
  type WalletTransactionsRequest,
  type WalletTransactionsResponse,
} from "@/features/wallet/model/walletTypes";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

export const walletQueryKeys = {
  all: ["wallet"] as const,
  summary: () => [...walletQueryKeys.all, "summary"] as const,
  transactions: (params: WalletTransactionsRequest) =>
    [...walletQueryKeys.all, "transactions", params] as const,
};

export function getWalletSummary() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetWalletSummary());
  }

  return unwrapApiResponse<WalletSummaryResponse>(apiClient.get("/api/wallet/v1/wallets/me"));
}

export function getWalletTransactions(params: WalletTransactionsRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetWalletTransactionList(params));
  }

  return unwrapApiResponse<WalletTransactionsResponse>(
    apiClient.get("/api/wallet/v1/wallets/me/transactions", { params }),
  );
}

export function useWalletSummaryQuery() {
  return useQuery({
    queryKey: walletQueryKeys.summary(),
    queryFn: getWalletSummary,
  });
}

export function useWalletTransactionsQuery(size = 20) {
  const params: WalletTransactionsRequest = {
    cursor: null,
    size,
  };

  return useQuery({
    queryKey: walletQueryKeys.transactions(params),
    queryFn: () => getWalletTransactions(params),
  });
}
