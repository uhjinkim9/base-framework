// utils/webpush.ts
export class WebPushManager {
  private registration: ServiceWorkerRegistration | null = null;

  // Service Worker 등록
  async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('웹 푸시가 지원되지 않습니다');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker 등록 성공:', this.registration);
      return true;
    } catch (error) {
      console.error('Service Worker 등록 실패:', error);
      return false;
    }
  }

  // 푸시 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('알림이 지원되지 않습니다');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('알림 권한이 거부되었습니다');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // 푸시 구독
  async subscribe(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    if (!this.registration) {
      console.error('Service Worker가 등록되지 않았습니다');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('푸시 구독 성공:', subscription);
      return subscription;
    } catch (error) {
      console.error('푸시 구독 실패:', error);
      return null;
    }
  }

  // 구독 해제
  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('푸시 구독 해제됨');
      }
      return true;
    } catch (error) {
      console.error('구독 해제 실패:', error);
      return false;
    }
  }

  // VAPID 키 변환 유틸리티
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // 푸시 알림 초기화 (권한 요청 + 구독)
  async initialize(vapidPublicKey: string): Promise<PushSubscription | null> {
    const swRegistered = await this.registerServiceWorker();
    if (!swRegistered) return null;

    const permissionGranted = await this.requestPermission();
    if (!permissionGranted) return null;

    return await this.subscribe(vapidPublicKey);
  }
}

export const webPushManager = new WebPushManager();