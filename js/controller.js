'use strict';

const applicationServerPublicKey = 'BPsNLT25jXPomOFbJpVxesNCwVE7p19Xnt8KOP00GhCp8RWDv9cJkTgtoLKfAUdWfg-uwF1xGcANFD9ALPZmxnU';

let isSubscribed = false;
let swRegistration = null;

var deviceDetection = function () { 
    var osVersion, device, deviceType, userAgent, isSmartphoneOrTablet; 
    
    device = (navigator.userAgent).match(/Android|iPhone|iPad|iPod/i); 
    
    if ( /Android/i.test(device) ) { 
        if ( !/mobile/i.test(navigator.userAgent) ) { 
            deviceType = 'tablet'; 
        } else { 
            deviceType = 'phone'; 
        } 
    
        osVersion = (navigator.userAgent).match(/Android\s+([\d\.]+)/i); 
        osVersion = osVersion[0]; 
        osVersion = osVersion.replace('Android ', ''); 
    
    } else if ( /iPhone/i.test(device) ) { 
        deviceType = 'phone'; 
        osVersion = (navigator.userAgent).match(/OS\s+([\d\_]+)/i); 
        osVersion = osVersion[0]; 
        osVersion = osVersion.replace(/_/g, '.'); 
        osVersion = osVersion.replace('OS ', ''); 
    
    } else if ( /iPad/i.test(device) ) { 
        deviceType = 'tablet'; 
        osVersion = (navigator.userAgent).match(/OS\s+([\d\_]+)/i); 
        osVersion = osVersion[0]; 
        osVersion = osVersion.replace(/_/g, '.'); 
        osVersion = osVersion.replace('OS ', ''); 
    } 
    isSmartphoneOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent); 
    userAgent = navigator.userAgent; 
    
    return { 'isSmartphoneOrTablet': isSmartphoneOrTablet, 
             'device': device, 
             'osVersion': osVersion, 
             'userAgent': userAgent, 
             'deviceType': deviceType 
            }; 
    }();



	function postData(data) {
	var xhttp = new XMLHttpRequest();
	xhttp.open('POST', 'https://guarded-brook-83933.herokuapp.com/subscribe', true);
	xhttp.setRequestHeader('Content-type', 'application/json');
	xhttp.send(data);
}

function wrapUserData(data) {
	var userData = {
		'subscription': JSON.parse(data),
		'ua': deviceDetection
	};

	return userData;
}

function urlB64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

function getUserPermission() {
	return new Promise(function (resolve, reject) {
		const permissionResult = Notification.requestPermission(function (result) {
			resolve(result);
		});

		if (permissionResult) {
			permissionResult.then(resolve, reject);
		}
	})
		.then(function (permissionResult) {
			if (permissionResult === 'granted') {
				registerServiceWorker();
			} else if (permissionResult !== 'granted') {
				console.log('Permission not granted');
			}
		})
}

function subscribeUser() {
	
	swRegistration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlB64ToUint8Array(applicationServerPublicKey)
	})
	.then(function(subscription) {
		document.querySelector('#subscription').innerHTML = JSON.stringify(subscription);		
		postData(JSON.stringify(wrapUserData(JSON.stringify(subscription))));
	})
	.catch(function(err) {
		console.log(err);
	});	
}

function initializeUI() {
	
	swRegistration.pushManager.getSubscription()
		.then(function(subscription) {
			isSubscribed = !(subscription === null);
			if (isSubscribed) {
				//
			} else {
				subscribeUser();
			}
		});
}

function updateSubscriptionOnServer(subscription) {
	// TODO: Send subscription to application server  
	const subscriptionJson = document.querySelector('.js-subscription-json');
	const subscriptionDetails = document.querySelector('.js-subscription-details');

	if (subscription) {
		subscriptionJson.textContent = JSON.stringify(subscription);
		subscriptionDetails.classList.remove('is-invisible');
	} else {
		subscriptionDetails.classList.add('is-invisible');
	}
}

function unsubscribeUser() {
	swRegistration.pushManager.getSubscription()
		.then(function (subscription) {
			if (subscription) {
				return subscription.unsubscribe();
			}
		})
		.catch(function (error) {
			console.log('Error unsubscribing', error);
		})
		.then(function () {
			updateSubscriptionOnServer(null);

			console.log('User is unsubscribed.');
			isSubscribed = false;
		});
}

function clickToSubscribe() {
    initializeUI();
}

function registerServiceWorker() {
	if ('serviceWorker' in navigator && 'PushManager' in window) {		
		navigator.serviceWorker.register('service-worker.js')
			.then(function (registration) {
				
				console.log('ServiceWorker registration successful with scope: ', registration);
				swRegistration = registration;
				initializeUI();
		})
		.catch(function (err) {
			console.log('ServiceWorker registration failed: ', err);
		});
	}
}

getUserPermission();

