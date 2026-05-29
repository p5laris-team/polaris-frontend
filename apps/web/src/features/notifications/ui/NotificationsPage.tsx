/**
 * 알림 목록 화면입니다.
 * 전체/안 읽음 필터를 바꾸며 알림을 조회하고,
 * 사용자가 알림을 누르면 단건 읽음 처리 후 연결된 화면으로 이동합니다.
 */
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
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

import { useQueryClient } from "@tanstack/react-query";
import {
  type NotificationFilter,
  markNotificationRead,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  notificationQueryKeys,
} from "@/features/notifications/api/notificationApi";
import {
  type AppNotification,
  type NotificationTargetType,
  type NotificationType,
} from "@/features/notifications/model/notificationTypes";
import { useHomeQuery, homeQueryKeys } from "@/features/home/api/homeApi";
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
  const homeQuery = useHomeQuery();
  const unreadCount = homeQuery.data?.notifications.unreadCount ?? 0;
  const [pendingNotificationId, setPendingNotificationId] = useState<number | null>(null);
  const notificationsQuery = useNotificationsQuery(filter);
  const markReadMutation = useMarkNotificationReadMutation();
  const queryClient = useQueryClient();

  const [displayNotifications, setDisplayNotifications] = useState<AppNotification[]>([]);
  const [processedIds, setProcessedIds] = useState<Set<number>>(new Set());
  
  const fetchedNotifications = useMemo(
    () => notificationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [notificationsQuery.data?.pages],
  );

  // 탭 필터가 바뀌면 화면 표시 목록 및 처리된 ID 초기화
  useEffect(() => {
    setDisplayNotifications([]);
    setProcessedIds(new Set());
  }, [filter]);

  // 가져온 알림 데이터와 로컬 상태 동기화 및 머지
  useEffect(() => {
    if (fetchedNotifications.length === 0) {
      setDisplayNotifications([]);
      return;
    }

    setDisplayNotifications((prev) => {
      const prevMap = new Map(prev.map((item) => [item.id, item]));
      return fetchedNotifications.map((fetchedItem) => {
        const prevItem = prevMap.get(fetchedItem.id);
        if (prevItem) {
          // 로컬에서 변경된 read 상태를 그대로 유지
          return {
            ...fetchedItem,
            read: prevItem.read,
          };
        }
        return fetchedItem;
      });
    });
  }, [fetchedNotifications]);



  // 탭 필터(filter)가 바뀔 때 이전 탭에서 읽음 처리된 데이터를 반영하기 위해 알림 캐시 무효화
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
  }, [filter, queryClient]);

  // 페이지를 나갈 때(언마운트 시) 알림 캐시를 무효화하여 나중에 재진입 시 최신 목록을 가져오게 합니다.
  useEffect(() => {
    return () => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    };
  }, [queryClient]);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = notificationsQuery;

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = observerRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /** 알림을 누르면 읽음 상태로 갱신합니다. (페이지 이동 없음) */
  const handleSelectNotification = (notification: AppNotification) => {
    const currentNotification = displayNotifications.find((item) => item.id === notification.id) ?? notification;

    if (currentNotification.read) {
      return;
    }

    setPendingNotificationId(currentNotification.id);
    markNotificationRead(currentNotification.id)
      .then(() => {
        setDisplayNotifications((prev) =>
          prev.map((item) => (item.id === currentNotification.id ? { ...item, read: true } : item))
        );
        void queryClient.invalidateQueries({ queryKey: homeQueryKeys.summary() });
      })
      .catch((error) => {
        showToast(getUserFacingErrorMessage(error));
      })
      .finally(() => {
        setPendingNotificationId(null);
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
          {(Object.keys(filterLabels) as NotificationFilter[]).map((filterKey) => {
            const label = filterLabels[filterKey];
            const displayLabel =
              filterKey === "unread" && unreadCount > 0
                ? `${label} ${unreadCount}`
                : label;

            return (
              <button
                aria-pressed={filter === filterKey}
                className={filter === filterKey ? "notifications-page__filter-button--active" : ""}
                key={filterKey}
                onClick={() => setFilter(filterKey)}
                type="button"
              >
                {displayLabel}
              </button>
            );
          })}
        </div>

        {/* 전체 읽음 API가 명세에 없어서 MVP에서는 각 알림을 누를 때 단건 PATCH로 읽음 처리한다. */}
        {displayNotifications.length > 0 ? (
          <>
            <ul className="notifications-page__list" aria-label="알림 목록">
              {displayNotifications.map((notification) => (
                <NotificationItem
                  disabled={markReadMutation.isPending}
                  key={notification.id}
                  notification={notification}
                  pending={pendingNotificationId === notification.id}
                  onClick={() => handleSelectNotification(notification)}
                />
              ))}
            </ul>
            <div className="notifications-page__sentinel" ref={observerRef}>
              {isFetchingNextPage ? (
                <p className="notifications-page__sentinel-loading">알림을 더 가져오는 중...</p>
              ) : null}
            </div>
          </>
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

/** 목록에 표시되는 알림 한 줄입니다. 읽음 여부와 처리 중 상태를 시각적으로 구분합니다. */
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

/** 알림 화면의 헤더, 설정 바로가기, 하단 탭을 묶습니다. */
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

/** 알림 목록을 불러오는 동안 표시하는 skeleton 화면입니다. */
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

/** 알림 타입 enum을 화면 아이콘, 라벨, 색상 톤으로 변환합니다. */
function getNotificationMeta(type: NotificationType) {
  if (type === "MISSION" || type === "MISSION_OFFER") {
    return {
      icon: <Target size={20} strokeWidth={1.8} />,
      label: "미션",
      tone: "mission",
    };
  }

  if (type === "CARE" || type === "STATE_BAD" || type === "STATE_CRITICAL" || type === "CHARACTER_STATE") {
    return {
      icon: <HeartPulse size={20} strokeWidth={1.8} />,
      label: "상태",
      tone: "state",
    };
  }

  if (type === "ATTENDANCE" || type === "DAILY_REMINDER") {
    return {
      icon: <CalendarCheck size={20} strokeWidth={1.8} />,
      label: "리마인더",
      tone: "daily",
    };
  }

  if (type === "ACHIEVEMENT") {
    return {
      icon: <CalendarCheck size={20} strokeWidth={1.8} />,
      label: "달성",
      tone: "daily",
    };
  }

  if (type === "SHARE") {
    return {
      icon: <ShoppingBag size={20} strokeWidth={1.8} />,
      label: "공유",
      tone: "system",
    };
  }

  return {
    icon: <ShoppingBag size={20} strokeWidth={1.8} />,
    label: "소식",
    tone: "system",
  };
}

/** 알림 targetType을 현재 앱에서 이동 가능한 route로 연결합니다. */
function resolveNotificationRoute(targetType: NotificationTargetType | null) {
  // API targetType만으로 바로 갈 수 있는 화면에 연결한다. 미션 상세 화면은 아직 없어서 홈으로 보낸다.
  if (targetType === "MISSION") return routes.home;
  if (targetType === "CHARACTER") return routes.character;
  if (targetType === "ITEM") return routes.inventory;
  if (targetType === "ACHIEVEMENT") return routes.home;
  if (targetType === "SHARE") return routes.share;
  if (targetType === "ATTENDANCE") return routes.attendance;
  if (targetType === "WALLET") return routes.wallet;
  if (targetType === "SHOP") return routes.shop;

  return null;
}

/** 생성 시각을 '방금', 'N분 전' 같은 상대 시간으로 표시합니다. */
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
