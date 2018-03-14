
'use strict';

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
  
    const title = 'Push Instal';
    const options = {
      body: `${event.data.text()}`,
      icon: 'https://images.contentful.com/u5xczhazxdam/6gu1fH9IJiCUI8Aq8Mw2UY/f6a505a2ea6522c920250e1cd96cf501/social-share.jpg',
      badge: 'https://images.contentful.com/u5xczhazxdam/6gu1fH9IJiCUI8Aq8Mw2UY/f6a505a2ea6522c920250e1cd96cf501/social-share.jpg'
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
  });

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();
    event.waitUntil(clients.openWindow('https://www.instal.com'));
});
