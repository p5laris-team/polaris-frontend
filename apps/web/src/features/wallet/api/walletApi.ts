/**
 * 별조각 지갑 잔액과 거래 내역을 조회하는 API 계층입니다.
 * 보상/구매/출석 이후 다른 feature에서 지갑 캐시를 무효화할 때 이 query key를 사용합니다.
 */
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

/** 현재 사용자의 별조각 잔액 요약을 조회합니다. */
export function getWalletSummary() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetWalletSummary());
  }

  return unwrapApiResponse<WalletSummaryResponse>(apiClient.get("/api/wallet/v1/wallets/me"));
}

/** 별조각 적립/사용 거래 내역을 cursor pagination 형태로 조회합니다. */
export function getWalletTransactions(params: WalletTransactionsRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetWalletTransactionList(params));
  }

  return unwrapApiResponse<WalletTransactionsResponse>(
    apiClient.get("/api/wallet/v1/wallets/me/transactions", { params }),
  );
}

/** 지갑 화면 상단 잔액 카드가 사용하는 조회 hook입니다. */
export function useWalletSummaryQuery() {
  return useQuery({
    queryKey: walletQueryKeys.summary(),
    queryFn: getWalletSummary,
  });
}

/** 지갑 화면의 거래 내역 목록이 사용하는 조회 hook입니다. */
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
