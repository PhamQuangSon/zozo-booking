// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Parse the firebase config passed via URL parameters
const urlParams = new URLSearchParams(location.search);
const firebaseConfigStr = urlParams.get('firebaseConfig');

if (firebaseConfigStr) {
  const firebaseConfig = JSON.parse(firebaseConfigStr);
  
  // Initialize the Firebase app in the service worker
  firebase.initializeApp(firebaseConfig);

  // Retrieve an instance of Firebase Messaging so that it can handle background messages.
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    // Customize notification here
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification?.body,
      icon: '/placeholder.svg' // You can replace this with your app's logo
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.log('[firebase-messaging-sw.js] No config found, skipping initialization');
}
