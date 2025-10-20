"use client";
import {
  subscribeUserToPush,
  unsubscribeUserFromPush,
} from "@/util/api/push-subscribe";
import {VAPID_PUBLIC_KEY} from "@/util/common/config";

export default function PushTestButton() {
  const subscribe = async () => {
    const vapidPublicKey = VAPID_PUBLIC_KEY!;
    await subscribeUserToPush(vapidPublicKey);
    console.log("🎉 푸시 구독 완료");
  };

  const unsubscribe = async () => {
    await unsubscribeUserFromPush();
    console.log("🎉 푸시 구독 해제");
  };

  return (
    <>
      <button onClick={subscribe}>푸시 알림 켜기</button>
      <button onClick={unsubscribe}>푸시 알림 끄기</button>
    </>
  );
}

// 이제 브라우저에서 이 컴포넌트를 렌더링하면 다음 흐름이 실행됩니다:

// 서비스워커 등록 → /public/sw.js 찾아 등록
// 알림 권한 요청 → Notification.requestPermission()
// Push 구독 생성 → 브라우저가 subscription(endpoint + 키 쌍) 발급
// 서버 전송 → /api/notification/subscribe API 호출
