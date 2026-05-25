import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { homeQueryKeys } from "@/features/home/api/homeApi";
import { inventoryQueryKeys } from "@/features/inventory/api/inventoryApi";
import {
  demoGetShopItems,
  demoPurchaseShopItem,
} from "@/features/shop/model/shopFixtures";
import { walletQueryKeys } from "@/features/wallet/api/walletApi";
import {
  type PurchaseShopItemRequest,
  type PurchaseShopItemResponse,
  type ShopItemsRequest,
  type ShopItemsResponse,
} from "@/features/shop/model/shopTypes";
import { apiClient, createIdempotencyKey, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

const DEFAULT_SHOP_PAGE_SIZE = 20;

export const shopQueryKeys = {
  all: ["shop"] as const,
  items: (params: ShopItemsRequest) =>
    [...shopQueryKeys.all, "items", params.itemType, params.active, params.cursor ?? null, params.size] as const,
  skins: () =>
    shopQueryKeys.items({
      itemType: "SKIN",
      active: true,
      cursor: null,
      size: DEFAULT_SHOP_PAGE_SIZE,
    }),
  consumables: () =>
    shopQueryKeys.items({
      itemType: "CONSUMABLE",
      active: true,
      cursor: null,
      size: DEFAULT_SHOP_PAGE_SIZE,
    }),
};

export function getShopItems(params: ShopItemsRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetShopItems(params));
  }

  return unwrapApiResponse<ShopItemsResponse>(
    apiClient.get("/api/item/v1/items", { params }),
  );
}

export function purchaseShopItem(body: PurchaseShopItemRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoPurchaseShopItem(body));
  }

  // 아이템 구매는 중복 클릭/네트워크 재시도에서 같은 결제가 반복되지 않도록 gateway의 멱등키 헤더를 명시적으로 사용한다.
  const idempotencyKey = createIdempotencyKey(`item-purchase:${body.itemId}:${body.quantity}`);

  return unwrapApiResponse<PurchaseShopItemResponse>(
    apiClient.post("/api/item/v1/item-purchases", body, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    }),
  );
}

export function useShopSkinItemsQuery() {
  const params: ShopItemsRequest = {
    itemType: "SKIN",
    active: true,
    cursor: null,
    size: DEFAULT_SHOP_PAGE_SIZE,
  };

  return useQuery({
    queryKey: shopQueryKeys.items(params),
    queryFn: () => getShopItems(params),
  });
}

export function useShopConsumableItemsQuery() {
  const params: ShopItemsRequest = {
    itemType: "CONSUMABLE",
    active: true,
    cursor: null,
    size: DEFAULT_SHOP_PAGE_SIZE,
  };

  return useQuery({
    queryKey: shopQueryKeys.items(params),
    queryFn: () => getShopItems(params),
  });
}

export function usePurchaseShopItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseShopItem,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shopQueryKeys.skins() }),
        queryClient.invalidateQueries({ queryKey: shopQueryKeys.consumables() }),
        queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.skins() }),
        queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.consumables() }),
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.summary() }),
        queryClient.invalidateQueries({ queryKey: walletQueryKeys.all }),
      ]);

      // 소모품 구매 직후 돌봄 화면으로 이동하면 이전 보유 수량 캐시가 잠깐 보이지 않도록 비운다.
      queryClient.removeQueries({ queryKey: inventoryQueryKeys.consumables() });
    },
  });
}
