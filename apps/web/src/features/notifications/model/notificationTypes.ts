/**
 * 알림 목록과 읽음 처리 API 타입입니다.
 * 알림 타입은 UI 아이콘/라벨을, targetType은 클릭 후 이동할 화면을 결정합니다.
 */
import { type CursorPage } from "@/shared/api/types";

export type NotificationType =
  // 미션 관련 일반 알림입니다.
  | "MISSION"
  // 새 미션 제안 알림입니다.
  | "MISSION_OFFER"
  // 캐릭터 돌봄/상태 관련 알림입니다.
  | "CARE"
  // 캐릭터 상태가 나빠졌다는 알림입니다.
  | "STATE_BAD"
  // 캐릭터 상태가 특히 위험하다는 알림입니다.
  | "STATE_CRITICAL"
  // 캐릭터 상태 변화 전체를 포괄하는 알림입니다.
  | "CHARACTER_STATE"
  // 출석 알림입니다.
  | "ATTENDANCE"
  // 출석/미션을 잊지 않게 알려주는 일일 알림입니다.
  | "DAILY_REMINDER"
  // 업적 달성 알림입니다.
  | "ACHIEVEMENT"
  // 공유 보상/공유 상태 알림입니다.
  | "SHARE"
  // 이벤트, 점검, 일반 안내처럼 특정 도메인에 묶이지 않는 알림입니다.
  | "SYSTEM";

export type NotificationTargetType =
  | "MISSION"
  | "CHARACTER"
  | "ITEM"
  | "ACHIEVEMENT"
  | "SHARE"
  | "ATTENDANCE"
  | "WALLET"
  | "SHOP"
  | "NONE";

/** 앱 알림 한 건입니다. read 값으로 안 읽음 필터와 배지를 계산합니다. */
export type AppNotification = {
  id: number;
  notificationType: NotificationType;
  title: string;
  message: string;
  targetType: NotificationTargetType | null;
  targetId: number | null;
  read: boolean;
  createdAt: string;
};

/** 알림 목록 조회 요청입니다. read가 없으면 전체, false면 안 읽음 목록입니다. */
export type NotificationListRequest = {
  read?: boolean;
  cursor?: string | null;
  size?: number;
};

/** cursor 기반 알림 목록 응답입니다. */
export type NotificationListResponse = CursorPage<AppNotification>;

/** 단건 읽음 처리 요청입니다. 현재 명세에서는 읽음 true만 보냅니다. */
export type NotificationReadRequest = {
  read: true;
};

/** 읽음 처리 후 갱신된 알림 상태입니다. */
export type NotificationReadResponse = {
  id: number;
  read: boolean;
  updatedAt: string;
};

/** 모두 읽음 처리 후 갱신된 알림 요약입니다. */
export type MarkAllNotificationsReadResponse = {
  updatedCount: number;
  unreadCount: number;
  updatedAt: string;
};

/** FCM registration token을 notification 서버에 저장하는 요청입니다. */
export type RegisterFcmTokenRequest = {
  token: string;
};

/** FCM registration token 저장 후 서버가 반환하는 토큰 row 정보입니다. */
export type RegisterFcmTokenResponse = {
  id: number;
  createdAt: string;
};

/** 사용자의 알림 수신 설정입니다. 서버 저장값을 그대로 화면 상태로 사용합니다. */
export type NotificationSetting = {
  pushEnabled: boolean;
  missionOfferEnabled: boolean;
  characterStateEnabled: boolean;
  dailyReminderEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
};

/** 알림 설정 수정 요청입니다. PATCH 시 전체 설정 스냅샷을 보냅니다. */
export type UpdateNotificationSettingRequest = NotificationSetting;
