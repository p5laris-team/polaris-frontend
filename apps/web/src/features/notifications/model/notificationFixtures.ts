import { demoSetUnreadNotificationCount } from "@/features/home/model/homeFixture";
import {
  type AppNotification,
  type NotificationListRequest,
  type NotificationListResponse,
  type NotificationReadResponse,
} from "@/features/notifications/model/notificationTypes";

const DEMO_PAGE_SIZE = 20;

let demoNotifications: AppNotification[] = [
  {
    id: 600,
    notificationType: "MISSION",
    title: "작은 미션 하나가 기다리고 있어요",
    message: "오늘 별조각 하나가 아직 안 태어났어.",
    targetType: "MISSION",
    targetId: 101,
    read: false,
    createdAt: toIsoFromNow({ hours: 1 }),
  },
  {
    id: 601,
    notificationType: "STATE_BAD",
    title: "무무가 조금 출출해 보여요",
    message: "포만감이 낮아졌어요. 잠깐 들러서 챙겨줄까요?",
    targetType: "CHARACTER",
    targetId: 10,
    read: false,
    createdAt: toIsoFromNow({ hours: 3 }),
  },
  {
    id: 602,
    notificationType: "DAILY_REMINDER",
    title: "오늘 출석 도장이 아직 비어 있어요",
    message: "한 번만 콕 찍으면 별조각을 받을 수 있어요.",
    targetType: "ATTENDANCE",
    targetId: null,
    read: true,
    createdAt: toIsoFromNow({ days: 1, hours: 2 }),
  },
  {
    id: 603,
    notificationType: "SYSTEM",
    title: "새 스킨이 상점에 들어왔어요",
    message: "별조각으로 교환할 수 있는 새 외형을 둘러보세요.",
    targetType: "SHOP",
    targetId: null,
    read: true,
    createdAt: toIsoFromNow({ days: 2 }),
  },
];

syncDemoUnreadCount();

export function demoGetNotifications({
  read,
  cursor,
  size = DEMO_PAGE_SIZE,
}: NotificationListRequest): NotificationListResponse {
  const startIndex = cursor ? Number(cursor) : 0;
  const filteredItems =
    typeof read === "boolean"
      ? demoNotifications.filter((notification) => notification.read === read)
      : demoNotifications;
  const items = filteredItems.slice(startIndex, startIndex + size);
  const nextIndex = startIndex + items.length;
  const hasNext = nextIndex < filteredItems.length;

  return {
    items,
    pageInfo: {
      nextCursor: hasNext ? String(nextIndex) : null,
      hasNext,
      size,
    },
  };
}

export function demoMarkNotificationRead(notificationId: number): NotificationReadResponse {
  let updated = false;

  demoNotifications = demoNotifications.map((notification) => {
    if (notification.id !== notificationId) return notification;

    updated = true;

    return {
      ...notification,
      read: true,
    };
  });

  if (!updated) {
    throw new Error("읽음 처리할 알림을 찾지 못했어요.");
  }

  // 알림 fixture의 읽음 변경은 홈/마이페이지의 미읽음 요약과 같이 움직여야 화면 간 숫자가 맞는다.
  syncDemoUnreadCount();

  return {
    id: notificationId,
    read: true,
    updatedAt: new Date().toISOString(),
  };
}

function syncDemoUnreadCount() {
  demoSetUnreadNotificationCount(demoNotifications.filter((notification) => !notification.read).length);
}

function toIsoFromNow({ days = 0, hours = 0 }: { days?: number; hours?: number }) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);

  return date.toISOString();
}
