import axios from "axios";

export async function subscribeUserToPush(vapidPublicKey: string) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("이 브라우저는 푸시 알림을 지원하지 않습니다.");
    return null;
  }

  // 1. 서비스워커 등록
  const registration = await navigator.serviceWorker.register(
    "/service-worker.js",
  );

  // 2. 알림 권한 요청
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("알림이 브라우저에서 차단되었습니다.");
    return null;
  }

  // 3. 구독 생성
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  // 4. 서버에 구독 전송
  await axios.post(
    `${process.env.NEXT_PUBLIC_NOTIFICATION_URL}/notification/subscribe`,
    {
      subscription: subscription.toJSON(),
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    },
  );
  console.log(`✅ 구독 등록 성공`);

  return subscription;
}

/**
 * 푸시 구독 해제
 */
export async function unsubscribeUserFromPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("이 브라우저는 푸시 알림을 지원하지 않습니다.");
    return null;
  }

  // 1. 현재 등록된 서비스워커 가져오기
  const registration = await navigator.serviceWorker.ready;

  // 2. 현재 구독 정보 가져오기
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    console.log("현재 구독된 알림이 없습니다.");
    return null;
  }

  // 3. 브라우저 구독 해제
  const success = await subscription.unsubscribe();
  if (success) {
    // 4. 서버에도 해제 요청 (DB에서 삭제)
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_NOTIFICATION_URL}/notification/unsubscribe`,
        {
          endpoint: subscription.endpoint,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );
      console.log("✅ 서버 구독 해제 성공");
    } catch (err) {
      console.error("❌ 서버 구독 해제 실패", err);
    }
  }

  return success;
}

// Helper: VAPID key는 base64 → Uint8Array 변환 필요
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
