import { type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { type MessagePayload, type Messaging } from "firebase/messaging";

import { runtimeConfig } from "@/shared/config/env";

const FIREBASE_APP_NAME = "polaris-web-push";
const FIREBASE_MESSAGING_SW_PATH = "/firebase-messaging-sw.js";
const PUSH_TOKEN_REGISTERED_AT_KEY = "polaris:fcm-token-registered-at";

export type PushAvailability =
  | "checking"
  | "supported"
  | "disabled"
  | "not-configured"
  | "unsupported";

type PushRegistrationErrorCode =
  | "disabled"
  | "not-configured"
  | "unsupported"
  | "permission-denied"
  | "token-empty"
  | "unknown";

export class PushRegistrationError extends Error {
  constructor(
    public readonly code: PushRegistrationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PushRegistrationError";
  }
}

let messagingPromise: Promise<Messaging | null> | null = null;

/** 현재 브라우저와 env 설정에서 FCM Web Push를 사용할 수 있는지 확인한다. */
export async function getPushAvailability(): Promise<PushAvailability> {
  if (!runtimeConfig.webPush.enabled) return "disabled";
  if (!hasFirebaseMessagingConfig()) return "not-configured";
  if (!isBrowserPushApiAvailable()) return "unsupported";

  try {
    const { isSupported } = await import("firebase/messaging");

    return (await isSupported()) ? "supported" : "unsupported";
  } catch {
    return "unsupported";
  }
}

/** 브라우저가 기억하고 있는 알림 권한 상태를 즉시 읽는다. */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export function getStoredPushTokenRegisteredAt() {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(PUSH_TOKEN_REGISTERED_AT_KEY);
}

export function rememberPushTokenRegistered() {
  if (typeof window === "undefined") return null;

  const registeredAt = new Date().toISOString();
  window.localStorage.setItem(PUSH_TOKEN_REGISTERED_AT_KEY, registeredAt);
  return registeredAt;
}

/** 사용자 액션 안에서 권한을 요청하고 FCM registration token을 발급한다. */
export async function requestFcmRegistrationToken() {
  const availability = await getPushAvailability();
  if (availability !== "supported") {
    throw toAvailabilityError(availability);
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new PushRegistrationError(
      "permission-denied",
      "브라우저 알림 권한이 허용되지 않았습니다.",
    );
  }

  const messaging = await getPolarisMessaging();
  if (!messaging) {
    throw new PushRegistrationError("not-configured", "Firebase 메시징 설정이 비어 있습니다.");
  }

  const registration = await registerFirebaseMessagingServiceWorker();
  const { getToken } = await import("firebase/messaging");
  const token = await getToken(messaging, {
    vapidKey: runtimeConfig.webPush.vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new PushRegistrationError("token-empty", "FCM registration token을 발급받지 못했습니다.");
  }

  return token;
}

/** 앱이 켜진 상태에서 수신한 FCM 메시지를 화면 레이어에 전달한다. */
export async function listenForegroundPushMessages(
  listener: (payload: MessagePayload) => void,
) {
  const availability = await getPushAvailability();
  if (availability !== "supported") {
    return () => undefined;
  }

  const messaging = await getPolarisMessaging();
  if (!messaging) {
    return () => undefined;
  }

  const { onMessage } = await import("firebase/messaging");

  return onMessage(messaging, listener);
}

export function getPushRegistrationErrorMessage(error: unknown) {
  if (error instanceof PushRegistrationError) {
    if (error.code === "disabled") return "이 환경에서는 아직 알림 기능이 꺼져 있어요.";
    if (error.code === "not-configured") return "알림 연결 설정이 아직 준비되지 않았어요.";
    if (error.code === "unsupported") return "이 브라우저에서는 앱 알림을 받을 수 없어요.";
    if (error.code === "permission-denied") {
      return "브라우저 알림 권한이 꺼져 있어요. 브라우저 설정에서 다시 허용해야 해요.";
    }
    if (error.code === "token-empty") return "이 기기 알림을 연결하지 못했어요. 잠시 후 다시 시도해 주세요.";
  }

  return "이 기기 알림을 켜는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
}

export function getForegroundPushToastCopy(payload: MessagePayload) {
  return {
    title: payload.notification?.title || payload.data?.title || "새 알림",
    body: payload.notification?.body || payload.data?.body || "Polaris에 새 소식이 도착했어요.",
  };
}

function getPolarisMessaging() {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      const availability = await getPushAvailability();
      if (availability !== "supported") return null;

      const { getMessaging } = await import("firebase/messaging");

      return getMessaging(await getPolarisFirebaseApp());
    })();
  }

  return messagingPromise;
}

async function getPolarisFirebaseApp(): Promise<FirebaseApp> {
  const { getApps, initializeApp } = await import("firebase/app");
  const existingApp = getApps().find((app) => app.name === FIREBASE_APP_NAME);
  if (existingApp) return existingApp;

  return initializeApp(getFirebaseOptions(), FIREBASE_APP_NAME);
}

function getFirebaseOptions(): FirebaseOptions {
  const config = runtimeConfig.webPush.firebase;

  return {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    measurementId: config.measurementId,
  };
}

function hasFirebaseMessagingConfig() {
  const config = runtimeConfig.webPush.firebase;

  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.messagingSenderId &&
      config.appId &&
      runtimeConfig.webPush.vapidKey,
  );
}

function isBrowserPushApiAvailable() {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    "Notification" in window
  );
}

function registerFirebaseMessagingServiceWorker() {
  return navigator.serviceWorker.register(buildFirebaseMessagingServiceWorkerUrl(), {
    scope: "/",
  });
}

function buildFirebaseMessagingServiceWorkerUrl() {
  const config = runtimeConfig.webPush.firebase;
  const params = new URLSearchParams({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });

  if (config.measurementId) {
    params.set("measurementId", config.measurementId);
  }

  return `${FIREBASE_MESSAGING_SW_PATH}?${params.toString()}`;
}

function toAvailabilityError(availability: PushAvailability) {
  if (availability === "disabled") {
    return new PushRegistrationError("disabled", "웹 푸시 알림이 비활성화되어 있습니다.");
  }

  if (availability === "not-configured") {
    return new PushRegistrationError("not-configured", "Firebase 메시징 설정이 비어 있습니다.");
  }

  return new PushRegistrationError("unsupported", "웹 푸시 알림을 지원하지 않는 환경입니다.");
}
