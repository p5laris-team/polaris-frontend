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

export function getUserItems(params: UserItemsRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetUserItems(params));
  }

  return unwrapApiResponse<UserItemsResponse>(
    apiClient.get("/api/item/v1/user-items", { params }),
  );
}

export function updateEquippedSkin(characterId: number, body: UpdateEquippedSkinRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoUpdateEquippedSkin(characterId, body));
  }

  return unwrapApiResponse<UpdateEquippedSkinResponse>(
    apiClient.put(`/api/character/v1/characters/${characterId}/equipped-skin`, body),
  );
}

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
