

'use strict';

self.addEventListener('push', function(event) {
    //const _data = JSON.parse(event.data.text());
      
    const title = 'Push Instal';
    const options = {
      body: `${event.data.text()}`,
      icon: 'https://images.contentful.com/u5xczhazxdam/6gu1fH9IJiCUI8Aq8Mw2UY/f6a505a2ea6522c920250e1cd96cf501/social-share.jpg',
      badge: 'https://images.contentful.com/u5xczhazxdam/6gu1fH9IJiCUI8Aq8Mw2UY/f6a505a2ea6522c920250e1cd96cf501/social-share.jpg',
      image: 'https://scontent-mxp1-1.xx.fbcdn.net/v/t1.0-9/28795572_1812946842078123_1160688682378723328_o.jpg?oh=d4f6b2907ec9d8e8aa0dacceb239436a&oe=5B2D0F7F',
      actions: [
        {
          action: 'panel-close',
          title: 'Close',
          icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQmGd1fr-6Ogx0emacjgkBWT6Q6bFFKlm8MgQz9Z07QkQOR8po1Q'
        },
        {
          action: 'open-link',
          title: 'Read More',
          icon: 'https://cdn1.iconfinder.com/data/icons/seo-web-17/512/5-512.png'
        }
      ]
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
  });

self.addEventListener('notificationclick', function(event) {

  if (event.action === 'panel-close') {
      event.notification.close();
  } else if (event.action === 'open-link') {
    event.notification.close();
    event.waitUntil(clients.openWindow('https://www.instal.com'));
  }   
});

function getData(json_object, key, _defaultValue) {
  if (json_object.hasOwnProperty(key)) {
    return json_object[key];
  } else {
    return _defaultValue;
  }
}
