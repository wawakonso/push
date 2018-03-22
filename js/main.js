//var keys = generateVAPIDKeys();
var service_url = '/service-worker.js'

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')
    ;
    const rawData = Buffer.from(base64, 'base64').toString();
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function subscribeUserToPush() {
    return navigator.serviceWorker.register(service_url)
        .then(function(registration) {
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(BHwN5oIBWUjgBXEyZLbICo1322QjGmmWDziwvuB8b7NvEtw39CLw0iv7kQStpgstZV8dJHDKYcblHkdoIyDo2Sg) 
            };            
            return registration.pushManager.subscribe(subscribeOptions);
        })
        .then(function(pushSubscription) {
            console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
            return pushSubscription;
        })
}

function getUserPermission() {
    return new Promise(function(resolve, reject) {
        const permissionResult = Notification.requestPermission(function(result) {
            resolve(result);
        });

        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    })
    .then(function(permissionResult) {
        if(permissionResult === 'granted') {
            console.log(permissionResult);
            debugger
            subscribeUserToPush();
        } else if (permissionResult !== 'granted') {
            console.log('Permission not granted');
        }
    })
}

function clickToSubscribe() {
    subscribeUser();
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register(service_url).then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
          });
        });
      }
}

registerServiceWorker();
getUserPermission();
