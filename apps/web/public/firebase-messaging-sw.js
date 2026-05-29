/* global firebase */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

const configParams = new URL(self.location.href).searchParams;

firebase.initializeApp({
  apiKey: configParams.get("apiKey") || "",
  authDomain: configParams.get("authDomain") || "",
  projectId: configParams.get("projectId") || "",
  storageBucket: configParams.get("storageBucket") || "",
  messagingSenderId: configParams.get("messagingSenderId") || "",
  appId: configParams.get("appId") || "",
  measurementId: configParams.get("measurementId") || "",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // If the push message contains a notification payload, FCM automatically handles the display of the notification.
  // We must not call showNotification here to avoid duplicate notifications.
  if (payload.notification) {
    console.log("FCM automatically handles this notification payload. Skipping manual showNotification to prevent duplicates.");
    return;
  }

  const title = payload.data?.title || "새 알림";
  const origin = self.location.origin;
  const options = {
    body: payload.data?.body || "Polaris에 새 소식이 도착했어요.",
    icon: origin + "/icons/icon-192.png",
    badge: origin + "/icons/icon-192.png",
    data: payload.data || {},
  };

  self.registration.showNotification(title, options).catch((err) => {
    console.error("showNotification failed:", err);
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/app/notifications";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      return undefined;
    }),
  );
});
