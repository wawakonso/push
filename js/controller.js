'use strict';


// Public key used for generating subscription
const applicationServerPublicKey = 'BPsNLT25jXPomOFbJpVxesNCwVE7p19Xnt8KOP00GhCp8RWDv9cJkTgtoLKfAUdWfg-uwF1xGcANFD9ALPZmxnU';

let settings =  null;
let isSubscribed = false;
let swRegistration = null;
let api_endpoint = 'http://localhost:8080/subscribe';
let urlParams = new URLSearchParams(window.location.search);

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
    } else {
		device = 'Desktop'
		deviceType = 'desktop'; 
        osVersion = null;
	}
    isSmartphoneOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent); 
    userAgent = navigator.userAgent; 
	
	return { 
		'isMobileTablet': isSmartphoneOrTablet, 
		'device': device.toString(), 
		'osVersion': osVersion, 
		'userAgent': userAgent, 
		'deviceType': deviceType 
	}; 
}();

function postData(data) {
	var xhttp = new XMLHttpRequest();
	xhttp.open('POST', settings.apiEndpoint, true);
	xhttp.setRequestHeader('Content-type', 'application/json');
	xhttp.send(data);
}

function wrapUserData(data) {
	
	var userData = {
		'subscription': JSON.parse(data),
		'ua': deviceDetection,
		'click_id': urlParams.get('clickId', null)
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
			// redirect to page
		} else if (permissionResult !== 'granted') {
			// Permission not granted 
		}
	})
}

function subscribeUser() {
	
	swRegistration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlB64ToUint8Array(applicationServerPublicKey)
	})
	.then(function(subscription) {
		// Calling the api to save the subscription		
		postData(JSON.stringify(wrapUserData(JSON.stringify(subscription))));
	})
	.catch(function(err) {
		// Error raised when the subscription fails.
	});	
}

function initializeUI() {
	
	swRegistration.pushManager.getSubscription()
		.then(function(subscription) {
			isSubscribed = !(subscription === null);
			if (isSubscribed) {
				// if user browser is already subscribed
				//redirect to ...				
				redirectTo(settings.redirectUrl);
			} else {
				subscribeUser();
			}
		});
}

function clickToSubscribe() {
    initializeUI();
}

function requestPermission() {
	getUserPermission();
}

// function that register the service worker in browser
function registerServiceWorker() {
	if ('serviceWorker' in navigator && 'PushManager' in window) {
		navigator.serviceWorker.register('https://github.com/wawakonso/push/service-worker.js')
			.then(
				registration => {
					swRegistration = registration;
					initializeUI();
				} 
			)
			.catch (error => {
				// Error raised when browser fails to get registration
			})		
	}
}

function redirectTo(url) {
	window.location.href = url;
}

function loadSettings(callback) {
	var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'settings/settings.json', true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") { 
			callback(xobj.responseText);
          }
    };
    xobj.send(null);
}

function initSettings() {
	loadSettings(function(response) {
		settings = JSON.parse(response);
	});
}

initSettings();
getUserPermission();


