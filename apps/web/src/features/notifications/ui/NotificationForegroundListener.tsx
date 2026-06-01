import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { homeQueryKeys } from "@/features/home/api/homeApi";
import { notificationQueryKeys } from "@/features/notifications/api/notificationApi";
import {
  getForegroundPushToastCopy,
  listenForegroundPushMessages,
} from "@/features/notifications/model/pushMessaging";
import { useToast } from "@/shared/ui";
import { useAuthStore } from "@/stores/authStore";

/**
 * 앱이 켜져 있을 때 도착한 FCM 메시지를 토스트와 캐시 갱신으로 연결한다.
 * 백그라운드 알림 표시는 public/firebase-messaging-sw.js가 담당한다.
 */
export function NotificationForegroundListener() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) return undefined;

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    void listenForegroundPushMessages((payload) => {
      const copy = getForegroundPushToastCopy(payload);
      
      // 브라우저 팝업 알림 (Notification API) 지원 여부 및 권한 검사
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(copy.title, {
            body: copy.body,
            icon: `${window.location.origin}/icons/icon-192.png`,
          });
        } catch (error) {
          // 일부 브라우저 예외 시 토스트로 폴백
          showToast(`${copy.title}: ${copy.body}`);
        }
      } else {
        // 권한이 없거나 지원하지 않는 경우 화면 하단 검은색 토스트로 폴백
        showToast(`${copy.title}: ${copy.body}`);
      }

      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: homeQueryKeys.summary() });
    })
      .then((cleanup) => {
        if (!mounted) {
          cleanup();
          return;
        }

        unsubscribe = cleanup;
      })
      .catch((error) => {
        // foreground 수신 실패는 알림 목록 조회 자체를 막지 않으므로 콘솔에만 남긴다.
        console.warn("FCM foreground listener setup failed:", error);
      });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [accessToken, queryClient, showToast]);

  return null;
}
