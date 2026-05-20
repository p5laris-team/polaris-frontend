import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { homeQueryKeys } from "@/features/home/api/homeApi";
import {
  demoGetNotifications,
  demoMarkNotificationRead,
} from "@/features/notifications/model/notificationFixtures";
import {
  type NotificationListRequest,
  type NotificationListResponse,
  type NotificationReadRequest,
  type NotificationReadResponse,
} from "@/features/notifications/model/notificationTypes";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

export type NotificationFilter = "all" | "unread";

const DEFAULT_NOTIFICATION_PAGE_SIZE = 20;

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: (filter: NotificationFilter) => [...notificationQueryKeys.all, "list", filter] as const,
};

export function getNotifications(params: NotificationListRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetNotifications(params));
  }

  return unwrapApiResponse<NotificationListResponse>(
    apiClient.get("/api/notification/v1/notifications", {
      params: {
        cursor: params.cursor ?? null,
        size: params.size ?? DEFAULT_NOTIFICATION_PAGE_SIZE,
        ...(typeof params.read === "boolean" ? { read: params.read } : {}),
      },
    }),
  );
}

export function markNotificationRead(
  notificationId: number,
  body: NotificationReadRequest = { read: true },
) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoMarkNotificationRead(notificationId));
  }

  return unwrapApiResponse<NotificationReadResponse>(
    apiClient.patch(`/api/notification/v1/notifications/${notificationId}`, body),
  );
}

export function useNotificationsQuery(filter: NotificationFilter) {
  return useQuery({
    queryKey: notificationQueryKeys.list(filter),
    queryFn: () =>
      getNotifications({
        read: filter === "unread" ? false : undefined,
        cursor: null,
        size: DEFAULT_NOTIFICATION_PAGE_SIZE,
      }),
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.summary() }),
      ]);
    },
  });
}
