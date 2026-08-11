import {
  deletePushSubscription,
  getPushSubscriptionStatus,
  savePushSubscription,
} from '@/lib/api';

export const isPushSupported = () => (
  typeof window !== 'undefined'
  && 'serviceWorker' in navigator
  && 'PushManager' in window
  && 'Notification' in window
);

const urlBase64ToUint8Array = (value: string) => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
};

const subscriptionPayload = (subscription: PushSubscription) => {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!json.endpoint || !p256dh || !auth) {
    throw new Error('Браузърът не върна валиден Push абонамент.');
  }
  return { endpoint: json.endpoint, p256dh, auth };
};

export async function currentPushSubscription() {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function currentPushRegistration() {
  const subscription = await currentPushSubscription();
  if (!subscription) return { subscription: null, registered: false };
  const status = await getPushSubscriptionStatus(subscription.endpoint);
  return { subscription, registered: status.subscribed };
}

export async function subscribeToPush(publicKey: string) {
  if (!isPushSupported()) throw new Error('Този браузър не поддържа Push известия.');
  if (!publicKey) {
    throw new Error('Push известията още не са активирани от администратора.');
  }

  // Keep the permission prompt directly inside the user's click gesture.
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Браузърът няма разрешение да показва известия.');
  }

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
  try {
    await savePushSubscription(subscriptionPayload(subscription));
  } catch (error) {
    // A newly-created local subscription must not look active when the server
    // failed to associate it with the authenticated account.
    if (!existing) await subscription.unsubscribe().catch(() => false);
    throw error;
  }
  return subscription;
}

export async function unsubscribeFromPush() {
  const subscription = await currentPushSubscription();
  if (!subscription) return;
  await deletePushSubscription(subscription.endpoint);
  await subscription.unsubscribe();
}
