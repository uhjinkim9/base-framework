export enum PlanTypes {
  SCHEDULE = 'schedule',
  TASK = 'task',
  BOOKING = 'booking',
  OCCASION = 'occasion',
  DAYOFF = 'dayoff',
  ZOOM = 'zoom',
}

export enum RepeatTypes {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  NONE = 'NONE',
}

export enum RepeatEndTypes {
  NEVER = 'never',
  COUNT = 'count',
  UNTIL = 'until',
}

export enum OffTypes {
  GENERAL = 'general',
  OCCASION = 'occasion',
  OFFICIAL = 'official',
  SICK = 'sick',
}

export enum HalfOffTypes {
  NONE = 'none',
  MORNING_OFF = 'morningOff', // 오전 반차
  AFTERNOON_OFF = 'afternoonOff', // 오후 반차
}

export enum ResourceTypes {
  MEETING_ROOM = 'meeting-room',
  TOOL = 'tool',
}

export enum PlanVisibilityTypes {
  PRIVATE = 'private', // 본인만 보기
  ATTENDEES = 'attendees', // 참석자만 보기
  DEPARTMENT = 'department', // 부서 공개
  DIVISION = 'division', // 본부 공개
  PUBLIC = 'public', // 전체 조직 공개
}
