import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { homeQueryKeys } from "@/features/home/api/homeApi";
import {
  demoGetShopItems,
  demoPurchaseShopItem,
} from "@/features/shop/model/shopFixtures";
import {
  type PurchaseShopItemRequest,
  type PurchaseShopItemResponse,
  type ShopItemsRequest,
  type ShopItemsResponse,
} from "@/features/shop/model/shopTypes";
import { apiClient, unwrapApiResponse } from "@/shared/api";
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

  // API 명세의 아이템 구매 request body는 itemId/quantity만 확정되어 있어 임의 멱등키 필드는 추가하지 않는다.
  return unwrapApiResponse<PurchaseShopItemResponse>(
    apiClient.post("/api/item/v1/item-purchases", body),
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

export function usePurchaseShopItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseShopItem,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shopQueryKeys.skins() }),
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.summary() }),
      ]);
    },
  });
}
