importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "نسخة_من_الـ_apiKey_هنا",
  projectId: "نسخة_من_الـ_projectId_هنا",
  messagingSenderId: "نسخة_من_الـ_messagingSenderId_هنا",
  appId: "نسخة_من_الـ_appId_هنا"
});

const messaging = firebase.messaging();

// ده الجزء اللي بيستلم الإشعار ويظهره للمدير
messaging.onBackgroundMessage((payload) => {
  console.log('وصل إشعار في الخلفية:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // حط لوجو موقعك هنا
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});