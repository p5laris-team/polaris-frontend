/**
 * 인벤토리 목록 조회와 캐릭터 스킨 장착 변경을 담당하는 API 계층입니다.
 * 상점 구매 결과와 캐릭터 외형이 이어지도록 inventory/character/home 캐시를 함께 관리합니다.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { characterCareQueryKeys } from "@/features/character/api/characterCareApi";
import { homeQueryKeys } from "@/features/home/api/homeApi";
import {
  demoGetUserItems,
  demoUpdateEquippedSkin,
} from "@/features/inventory/model/inventoryFixtures";
import {
  type UpdateEquippedSkinRequest,
  type UpdateEquippedSkinResponse,
  type UserItemsRequest,
  type UserItemsResponse,
} from "@/features/inventory/model/inventoryTypes";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

const DEFAULT_INVENTORY_PAGE_SIZE = 20;

/** 보유 아이템은 스킨/소모품 탭별로 캐시를 분리합니다. */
export const inventoryQueryKeys = {
  all: ["inventory"] as const,
  items: (params: UserItemsRequest) =>
    [...inventoryQueryKeys.all, "items", params.itemType, params.cursor ?? null, params.size] as const,
  skins: () =>
    inventoryQueryKeys.items({
      itemType: "SKIN",
      cursor: null,
      size: DEFAULT_INVENTORY_PAGE_SIZE,
    }),
  consumables: () =>
    inventoryQueryKeys.items({
      itemType: "CONSUMABLE",
      cursor: null,
      size: DEFAULT_INVENTORY_PAGE_SIZE,
    }),
};

/** 사용자가 보유한 아이템 목록을 조회합니다. */
export function getUserItems(params: UserItemsRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetUserItems(params));
  }

  return unwrapApiResponse<UserItemsResponse>(
    apiClient.get("/api/item/v1/user-items", { params }),
  );
}

/** 캐릭터에게 장착할 스킨을 변경하거나 기본 외형으로 되돌립니다. */
export function updateEquippedSkin(characterId: number, body: UpdateEquippedSkinRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoUpdateEquippedSkin(characterId, body));
  }

  return unwrapApiResponse<UpdateEquippedSkinResponse>(
    apiClient.put(`/api/character/v1/characters/${characterId}/equipped-skin`, body),
  );
}

/** 인벤토리의 스킨 탭 조회 hook입니다. */
export function useInventorySkinItemsQuery() {
  const params: UserItemsRequest = {
    itemType: "SKIN",
    cursor: null,
    size: DEFAULT_INVENTORY_PAGE_SIZE,
  };

  return useQuery({
    queryKey: inventoryQueryKeys.items(params),
    queryFn: () => getUserItems(params),
  });
}

/** 인벤토리의 소모품 탭 조회 hook입니다. */
export function useInventoryConsumableItemsQuery() {
  const params: UserItemsRequest = {
    itemType: "CONSUMABLE",
    cursor: null,
    size: DEFAULT_INVENTORY_PAGE_SIZE,
  };

  return useQuery({
    queryKey: inventoryQueryKeys.items(params),
    queryFn: () => getUserItems(params),
  });
}

/** 스킨 장착 성공 후 인벤토리/캐릭터/홈 캐시를 갱신합니다. */
export function useUpdateEquippedSkinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      characterId,
      body,
    }: {
      characterId: number;
      body: UpdateEquippedSkinRequest;
    }) => updateEquippedSkin(characterId, body),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.skins() }),
        queryClient.invalidateQueries({ queryKey: characterCareQueryKeys.active() }),
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.summary() }),
        queryClient.invalidateQueries({
          queryKey: characterCareQueryKeys.status(variables.characterId),
        }),
      ]);
    },
  });
}
