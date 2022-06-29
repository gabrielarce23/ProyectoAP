/**
 * Check out https://googlechromelabs.github.io/sw-toolbox/ for
 * more info on how to use sw-toolbox to custom configure your service worker.
 */

"use strict";
importScripts("./build/sw-toolbox.js");

importScripts("https://www.gstatic.com/firebasejs/4.9.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/4.9.0/firebase-messaging.js");

self.toolbox.options.cache = {
  name: "ionic-cache",
};
self.toolbox.options.networkTimeoutSeconds = 10;

// pre-cache our key assets
self.toolbox.precache([
  "./build/main.js",
  "./build/vendor.js",
  "./build/main.css",
  "./build/polyfills.js",
  "./assets/imgs/pitch.png",
  "./assets/imgs/logoxd.svg",
  "./assets/new_logo/nuevo_logo_xd.png",
  "index.html",
  "manifest.json",
]);

// dynamically cache any other local assets
self.toolbox.router.any("/*", self.toolbox.networkFirst);

// for any other requests go to the network, cache,
// and then only use that cached resource if your user goes offline
self.toolbox.router.default = self.toolbox.networkFirst;

firebase.initializeApp({
  // get this from Firebase console, Cloud messaging section
  messagingSenderId: "248085553994",
});

const messaging = firebase.messaging();

self.addEventListener("push", function (event) {
  var data = event.data.json();

  var notification = JSON.parse(data.data.notification);

  const notificationOptions = {
    icon: "assets/new_logo/icon-512x512.png",
    body: notification.body,
    badge: "assets/new_logo/nuevo_logo_xd.png",
  };
  if (notification.data && notification.data.tipo === "evento") {
    notificationOptions.actions = [
      { action: "voy", title: "💪🏽 Voy" },
      { action: "no_voy", title: "👎🏽 No voy" },
      { action: "duda", title: "🤔 Duda" },
    ];
    notificationOptions.data = notification.data;
  }
  event.waitUntil(
    self.registration.showNotification(notification.title, notificationOptions)
  );
});

self.addEventListener("notificationclick", function (event) {
  if (
    event.notification.data &&
    event.notification.data.tipo === "evento" &&
    event.action !== ""
  ) {
    const body = { usuario: { _id: event.notification.data.idUsuario } };
    if (event.action === "voy") {
      body.asiste = true;
    } else if (event.action === "no_voy") {
      body.asiste = false;
    }

    fetch(
      `${event.currentTarget.origin}/api/eventos/${event.notification.data.idEvento}/confirmar`,
      {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
          "x-auth": event.notification.data.token,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        event.notification.close();
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    clients.openWindow("" + event.currentTarget.origin);
  }
});

messaging.setBackgroundMessageHandler(function (payload) {
  console.log("Received background message ", payload);
  // here you can override some options describing what's in the message;
  // however, the actual content will come from the Webtask
  const notificationOptions = {
    icon: "assets/imgs/cei.png",
  };
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
