export type NotificationPayload = {
  event: string; // 이벤트 이름
  title: string; // 알림 제목
  body: string; // 알림 본문
  data?: Record<string, any>; // 추가 데이터 (링크, id 등)
};

/**
 * 사용자 알림 타입 정의
 */
export type UserNotification = {
  userNotificationIdx: number;
  notificationIdx: number;
  event: string;
  title: string;
  body: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
  isRead: boolean;
  readAt?: string;
  deliveredAt: string;
};

export interface NotificationListResponse {
  statusCode: number;
  message: string;
  data: UserNotification[];
}

export interface MarkAsReadResponse {
  statusCode: number;
  message: string;
  data: {
    success: boolean;
    message?: string;
  };
}

export interface UnreadCountResponse {
  statusCode: number;
  message: string;
  data: {
    count: number;
  };
}
