import { type ReactNode, useState } from "react";
import {
  CalendarCheck,
  Check,
  ChevronRight,
  HeartPulse,
  Settings,
  ShoppingBag,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  type NotificationFilter,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/features/notifications/api/notificationApi";
import {
  type AppNotification,
  type NotificationTargetType,
  type NotificationType,
} from "@/features/notifications/model/notificationTypes";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { emptyStateAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, Card, Header, Tag, useToast } from "@/shared/ui";

import "./NotificationsPage.css";

const filterLabels: Record<NotificationFilter, string> = {
  all: "전체",
  unread: "안 읽음",
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [pendingNotificationId, setPendingNotificationId] = useState<number | null>(null);
  const notificationsQuery = useNotificationsQuery(filter);
  const markReadMutation = useMarkNotificationReadMutation();
  const notifications = notificationsQuery.data?.items ?? [];

  const handleSelectNotification = (notification: AppNotification) => {
    const targetRoute = resolveNotificationRoute(notification.targetType);
    const moveToTarget = () => {
      if (targetRoute) {
        navigate(targetRoute);
      } else {
        showToast("연결된 화면이 없는 알림이에요.");
      }
    };

    if (notification.read) {
      moveToTarget();
      return;
    }

    setPendingNotificationId(notification.id);
    markReadMutation.mutate(notification.id, {
      onSuccess: moveToTarget,
      onError: (error) => {
        showToast(getUserFacingErrorMessage(error));
      },
      onSettled: () => {
        setPendingNotificationId(null);
      },
    });
  };

  if (notificationsQuery.isLoading) {
    return <NotificationsLoadingPage />;
  }

  if (notificationsQuery.isError) {
    return (
      <NotificationsFrame>
        <div className="notifications-page__state">
          <h2>알림을 불러오지 못했어요.</h2>
          <p>{getUserFacingErrorMessage(notificationsQuery.error)}</p>
          <Button onClick={() => void notificationsQuery.refetch()}>다시 불러오기</Button>
        </div>
      </NotificationsFrame>
    );
  }

  return (
    <NotificationsFrame>
      <div className="notifications-page__body">
        <div className="notifications-page__filter" aria-label="알림 필터">
          {(Object.keys(filterLabels) as NotificationFilter[]).map((filterKey) => (
            <button
              aria-pressed={filter === filterKey}
              className={filter === filterKey ? "notifications-page__filter-button--active" : ""}
              key={filterKey}
              onClick={() => setFilter(filterKey)}
              type="button"
            >
              {filterLabels[filterKey]}
            </button>
          ))}
        </div>

        {/* 전체 읽음 API가 명세에 없어서 MVP에서는 각 알림을 누를 때 단건 PATCH로 읽음 처리한다. */}
        {notifications.length > 0 ? (
          <ul className="notifications-page__list" aria-label="알림 목록">
            {notifications.map((notification) => (
              <NotificationItem
                disabled={markReadMutation.isPending}
                key={notification.id}
                notification={notification}
                pending={pendingNotificationId === notification.id}
                onClick={() => handleSelectNotification(notification)}
              />
            ))}
          </ul>
        ) : (
          <Card className="notifications-page__empty-card">
            <img
              alt=""
              className="notifications-page__empty-illustration"
              src={emptyStateAssets.notification}
            />
            <strong>{filter === "unread" ? "읽지 않은 알림이 없어요." : "새 알림이 없어요."}</strong>
            <p>새로운 미션이나 상태 변화가 생기면 이곳에 차곡차곡 쌓일 거예요.</p>
          </Card>
        )}
      </div>
    </NotificationsFrame>
  );
}

function NotificationItem({
  disabled,
  notification,
  pending,
  onClick,
}: {
  disabled: boolean;
  notification: AppNotification;
  pending: boolean;
  onClick: () => void;
}) {
  const meta = getNotificationMeta(notification.notificationType);

  return (
    <li>
      <button
        className={[
          "notifications-page__item",
          notification.read ? "notifications-page__item--read" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        <span className={`notifications-page__item-icon notifications-page__item-icon--${meta.tone}`}>
          {meta.icon}
        </span>
        <span className="notifications-page__item-copy">
          <span className="notifications-page__item-head">
            <strong>{notification.title}</strong>
            <small>{formatRelativeTime(notification.createdAt)}</small>
          </span>
          <span className="notifications-page__item-message">{notification.message}</span>
          <span className="notifications-page__item-meta">
            <Tag variant={notification.read ? "neutral" : "primary"}>
              {notification.read ? "읽음" : "새 알림"}
            </Tag>
            <span>{meta.label}</span>
          </span>
        </span>
        <span className="notifications-page__item-action">
          {pending ? <Check size={18} strokeWidth={2} /> : <ChevronRight size={18} strokeWidth={1.8} />}
        </span>
      </button>
    </li>
  );
}

function NotificationsFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <main className="notifications-page">
      <AppShell>
        <Header
          title="알림"
          onBack={() => navigate(routes.home)}
          right={
            <Button
              className="notifications-page__settings-button"
              onClick={() => navigate(routes.myPage)}
              size="compact"
              variant="ghost"
            >
              <Settings size={17} strokeWidth={1.9} />
              설정
            </Button>
          }
        />
        {children}
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}

function NotificationsLoadingPage() {
  return (
    <NotificationsFrame>
      <div className="notifications-page__body">
        <div className="notifications-page__skeleton notifications-page__skeleton--item" />
        <div className="notifications-page__skeleton notifications-page__skeleton--item" />
        <div className="notifications-page__skeleton notifications-page__skeleton--item" />
      </div>
    </NotificationsFrame>
  );
}

function getNotificationMeta(type: NotificationType) {
  if (type === "MISSION" || type === "MISSION_OFFER") {
    return {
      icon: <Target size={20} strokeWidth={1.8} />,
      label: "미션",
      tone: "mission",
    };
  }

  if (type === "STATE_BAD" || type === "STATE_CRITICAL" || type === "CHARACTER_STATE") {
    return {
      icon: <HeartPulse size={20} strokeWidth={1.8} />,
      label: "상태",
      tone: "state",
    };
  }

  if (type === "DAILY_REMINDER") {
    return {
      icon: <CalendarCheck size={20} strokeWidth={1.8} />,
      label: "리마인더",
      tone: "daily",
    };
  }

  return {
    icon: <ShoppingBag size={20} strokeWidth={1.8} />,
    label: "소식",
    tone: "system",
  };
}

function resolveNotificationRoute(targetType: NotificationTargetType) {
  // API targetType만으로 바로 갈 수 있는 화면에 연결한다. 미션 상세 화면은 아직 없어서 홈으로 보낸다.
  if (targetType === "MISSION") return routes.home;
  if (targetType === "CHARACTER") return routes.character;
  if (targetType === "ATTENDANCE") return routes.attendance;
  if (targetType === "WALLET") return routes.wallet;
  if (targetType === "SHOP") return routes.shop;

  return null;
}

function formatRelativeTime(value: string) {
  const createdAt = new Date(value).getTime();
  const diffMs = Date.now() - createdAt;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60_000));

  if (diffMinutes < 1) return "방금";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
