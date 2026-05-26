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
  const title = payload.notification?.title || payload.data?.title || "새 알림";
  const options = {
    body: payload.notification?.body || payload.data?.body || "Polaris에 새 소식이 도착했어요.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
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
