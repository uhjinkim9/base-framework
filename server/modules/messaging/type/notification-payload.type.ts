export type NotificationEventPayload = {
  event: string; // event 이름
  title: string;
  body: string;
  userId?: string; // 개별 알림인 경우 대상 userId
  userIds?: string[]; // 멀티 유저 알림 (브로드캐스트)인 경우 대상 userIds
  roleKeys?: string[]; // 역할 기반 알림인 경우 (TODO: 아직 미확장 상태)
  data?: Record<string, any>; // 알림과 함께 전달할 추가 데이터
};
