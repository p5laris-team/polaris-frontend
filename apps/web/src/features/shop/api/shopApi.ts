/**
 * 상점 목록 조회와 아이템 구매를 담당하는 API 계층입니다.
 * 구매 성공 후 지갑, 인벤토리, 홈 요약을 갱신해 별조각/보유 수량이 어긋나지 않게 합니다.
 */
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

/** 상점은 스킨/소모품 탭을 따로 조회하므로 query key도 탭별로 분리합니다. */
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

/** 상점에 노출할 아이템 목록을 조회합니다. */
export function getShopItems(params: ShopItemsRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetShopItems(params));
  }

  return unwrapApiResponse<ShopItemsResponse>(
    apiClient.get("/api/item/v1/items", { params }),
  );
}

/** 아이템을 구매합니다. 같은 구매가 중복 처리되지 않도록 멱등성 키를 붙입니다. */
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

/** 스킨 상점 탭에서 사용하는 조회 hook입니다. */
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

/** 소모품 상점 탭에서 사용하는 조회 hook입니다. */
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

/** 구매 성공 후 관련 화면 캐시를 갱신하는 mutation hook입니다. */
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
