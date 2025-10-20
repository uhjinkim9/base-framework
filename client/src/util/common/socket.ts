import {io, Socket} from "socket.io-client";

let socket: Socket | null = null;

// 읽지 않은 알림 개수 업데이트 콜백 타입
type UnreadCountCallback = (count: number) => void;
let unreadCountCallbacks: UnreadCountCallback[] = [];

// 새로운 알림 수신 콜백 타입
type NewNotificationCallback = (data: any) => void;
let newNotificationCallbacks: NewNotificationCallback[] = [];

const url = process.env.NEXT_PUBLIC_NOTIFICATION_URL + "/notification";

export function connectSocket(token: string) {
  if (!socket) {
    socket = io(url, {
      auth: {token},
    });

    socket.on("connect", () => {
      console.log("✅ WebSocket 연결:", socket?.id);
      // 연결 후 자동으로 인증 및 사용자 방 참여
      if (socket) {
        socket.emit("join-room", {message: "사용자 방 참여 요청"});
      }
    });

    socket.on("join-room-success", (data) => {
      console.log("🎉 사용자 방 참여 성공:", data);
    });

    socket.on("join-room-error", (error) => {
      console.error("❌ 사용자 방 참여 실패:", error);
    });

    // 🔥 읽지 않은 알림 개수 실시간 업데이트
    socket.on("unread-count-updated", (data: {count: number}) => {
      console.log("🔔 읽지 않은 알림 개수 업데이트:", data.count);
      unreadCountCallbacks.forEach((callback) => callback(data.count));
    });

    // 🔥 새로운 알림 수신 (통합 이벤트)
    socket.on("new-notification", (data: any) => {
      console.log("🔔 새로운 알림 수신:", data);
      newNotificationCallbacks.forEach((callback) => callback(data));
    });

    // 🔥 모든 알림 이벤트 자동 캠치
    socket.onAny((eventName: string, data: any) => {
      // 시스템 이벤트 제외
      const systemEvents = [
        "connect",
        "disconnect",
        "join-room-success",
        "join-room-error",
        "unread-count-updated",
        "new-notification",
      ];

      if (!systemEvents.includes(eventName)) {
        console.log(`🔔 알림 이벤트 자동 캠치: ${eventName}`, data);
        newNotificationCallbacks.forEach((callback) =>
          callback({event: eventName, ...data}),
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket 끊김");
    });
  }
  return socket;
}

// 읽지 않은 알림 개수 변경 리스너 등록
export function onUnreadCountChange(callback: UnreadCountCallback) {
  unreadCountCallbacks.push(callback);

  // 정리 함수 반환
  return () => {
    unreadCountCallbacks = unreadCountCallbacks.filter((cb) => cb !== callback);
  };
}

// 새로운 알림 수신 리스너 등록
export function onNewNotification(callback: NewNotificationCallback) {
  newNotificationCallbacks.push(callback);

  // 정리 함수 반환
  return () => {
    newNotificationCallbacks = newNotificationCallbacks.filter(
      (cb) => cb !== callback,
    );
  };
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
