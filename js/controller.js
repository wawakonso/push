'use strict';

const applicationServerPublicKey = 'BBnl1no3wRpXiQdAKo-sFNBr8dM6dIHlEuW1KuA5cFkgvOlhQyHf7P5IM8wpAZ9LpuYDveykxJR5PAHa4QxgCvo';

let isSubscribed = false;
let swRegistration = null;

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

/* function subscribeUserToPush() {
	return navigator.serviceWorker.register('http://localhost/push/service-worker.js')
		.then(function (registration) {
			const subscribeOptions = {
				userVisibleOnly: true,
				applicationServerKey: urlB64ToUint8Array(applicationServerPublicKey)
			};
			return registration.pushManager.subscribe(subscribeOptions);
		})
		.then(function (pushSubscription) {
			console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
			return pushSubscription;
		})
} */

function subscribeUser() {
	
	swRegistration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlB64ToUint8Array(applicationServerPublicKey)
	})
	.then(function(subscription) {
		console.log(subscription);
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
				console.log('User is subscribed');
			} else {
				console.log('User is not subscribed');
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

function updateBtn() {

	if (Notification.permission === 'denied') {
		pushButton.textContent = 'Push Messaging Blocked';
		pushButton.disabled = true;
		updateSubscriptionOnServer(null);
		return;
	}

	if (isSubscribed) {
		//pushButton.textContent = 'Disable Push Messaging';
	} else {
		//pushButton.textContent = 'Enable Push Messaging';
	}
	//pushButton.disabled = false;
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
		})
		.catch(function (err) {
			console.log('ServiceWorker registration failed: ', err);
		});
	}
}

getUserPermission();
