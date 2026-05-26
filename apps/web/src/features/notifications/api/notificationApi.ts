/**
 * 알림 목록 조회와 읽음 처리를 담당하는 API 계층입니다.
 * 알림을 읽으면 홈의 unread count도 함께 바뀌므로 홈 캐시를 같이 갱신합니다.
 */
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
  type RegisterFcmTokenRequest,
  type RegisterFcmTokenResponse,
} from "@/features/notifications/model/notificationTypes";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

export type NotificationFilter = "all" | "unread";

const DEFAULT_NOTIFICATION_PAGE_SIZE = 20;

/** 전체/읽지 않음 탭별 알림 목록 캐시 키입니다. */
export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: (filter: NotificationFilter) => [...notificationQueryKeys.all, "list", filter] as const,
};

/** 알림 목록을 조회합니다. filter에 따라 read 파라미터를 선택적으로 보냅니다. */
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

/** 특정 알림의 읽음 상태를 변경합니다. 기본값은 읽음 처리입니다. */
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

/** 이 브라우저에서 발급한 FCM registration token을 notification 서버에 저장합니다. */
export function registerFcmToken(body: RegisterFcmTokenRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve<RegisterFcmTokenResponse>({
      id: Date.now(),
      createdAt: new Date().toISOString(),
    });
  }

  return unwrapApiResponse<RegisterFcmTokenResponse>(
    apiClient.post("/api/notification/v1/subscriptions/", body),
  );
}

/** 알림 목록 화면에서 전체/읽지 않음 탭을 조회하는 hook입니다. */
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

/** FCM token 저장 후 알림 목록과 홈 배지를 다시 맞춥니다. */
export function useRegisterFcmTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RegisterFcmTokenRequest) => registerFcmToken(body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.summary() }),
      ]);
    },
  });
}

/** 알림 읽음 처리 후 알림 목록과 홈 요약을 다시 조회합니다. */
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
