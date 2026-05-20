import { type CursorPage } from "@/shared/api/types";

export type NotificationType =
  | "MISSION"
  | "MISSION_OFFER"
  | "STATE_BAD"
  | "STATE_CRITICAL"
  | "CHARACTER_STATE"
  | "DAILY_REMINDER"
  | "SYSTEM";

export type NotificationTargetType =
  | "MISSION"
  | "CHARACTER"
  | "ATTENDANCE"
  | "WALLET"
  | "SHOP"
  | "NONE";

export type AppNotification = {
  id: number;
  notificationType: NotificationType;
  title: string;
  message: string;
  targetType: NotificationTargetType;
  targetId: number | null;
  read: boolean;
  createdAt: string;
};

export type NotificationListRequest = {
  read?: boolean;
  cursor?: string | null;
  size?: number;
};

export type NotificationListResponse = CursorPage<AppNotification>;

export type NotificationReadRequest = {
  read: true;
};

export type NotificationReadResponse = {
  id: number;
  read: boolean;
  updatedAt: string;
};
