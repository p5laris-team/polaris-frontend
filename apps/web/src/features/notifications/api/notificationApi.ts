/**
 * 알림 목록 조회와 읽음 처리를 담당하는 API 계층입니다.
 * 알림을 읽으면 홈의 unread count도 함께 바뀌므로 홈 캐시를 같이 갱신합니다.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { homeQueryKeys } from "@/features/home/api/homeApi";
import {
  demoGetNotificationSetting,
  demoGetNotifications,
  demoMarkNotificationRead,
  demoUpdateNotificationSetting,
} from "@/features/notifications/model/notificationFixtures";
import {
  type NotificationListRequest,
  type NotificationListResponse,
  type NotificationReadRequest,
  type NotificationReadResponse,
  type NotificationSetting,
  type RegisterFcmTokenRequest,
  type RegisterFcmTokenResponse,
  type UpdateNotificationSettingRequest,
} from "@/features/notifications/model/notificationTypes";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

export type NotificationFilter = "all" | "unread";

const DEFAULT_NOTIFICATION_PAGE_SIZE = 20;

/** 전체/읽지 않음 탭별 알림 목록 캐시 키입니다. */
export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: (filter: NotificationFilter) => [...notificationQueryKeys.all, "list", filter] as const,
  setting: () => [...notificationQueryKeys.all, "setting"] as const,
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

/** 로그인한 사용자의 알림 수신 설정을 조회합니다. */
export function getNotificationSetting() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetNotificationSetting());
  }

  return unwrapApiResponse<NotificationSetting>(apiClient.get("/api/notification/v1/settings"));
}

/** 로그인한 사용자의 알림 수신 설정을 갱신합니다. */
export function updateNotificationSetting(body: UpdateNotificationSettingRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoUpdateNotificationSetting(body));
  }

  return unwrapApiResponse<NotificationSetting>(
    apiClient.patch("/api/notification/v1/settings", body),
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

/** 마이페이지 알림 설정 카드에서 사용하는 조회 hook입니다. */
export function useNotificationSettingQuery() {
  return useQuery({
    queryKey: notificationQueryKeys.setting(),
    queryFn: getNotificationSetting,
  });
}

/** 알림 설정 저장 mutation입니다. 저장 중에도 UI가 즉시 반응하도록 query cache를 먼저 갱신합니다. */
export function useUpdateNotificationSettingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateNotificationSettingRequest) => updateNotificationSetting(body),
    onMutate: async (nextSetting) => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.setting() });
      const previousSetting = queryClient.getQueryData<NotificationSetting>(
        notificationQueryKeys.setting(),
      );

      queryClient.setQueryData(notificationQueryKeys.setting(), nextSetting);

      return { previousSetting };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSetting) {
        queryClient.setQueryData(notificationQueryKeys.setting(), context.previousSetting);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.setting() });
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
