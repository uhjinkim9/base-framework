import {SideBarMenuType} from "@/types/menu.type";
import {ModeType} from "./common.type";

export type CalendarSelectOptionType = {
  label: string;
  value: string;
};

export type CheckedCalType = {name: string; checked: boolean};

export type PlanType = {
  planType?: PlanTypes;
  planIdx?: number;
  menuIdx?: string | number;
  title?: string;
  visibility?: PlanVisibilityTypes;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string;
  endedAt?: string;
  isAllday?: boolean;
  isRepeated?: boolean;
  memo?: string;

  planMenu?: SideBarMenuType;
  schedule?: ScheduleType;
  dayoff?: DayoffType;
  task?: TaskType;
  repeatRule?: RepeatRuleType;
};

export type RepeatRuleType = {
  idx?: number;
  planIdx?: number;
  freq?: RepeatTypes; // 반복 주기
  interval?: number; // 반복 간격
  byweekday?: string; // 요일 조건 (ex: 'MO,TU,FR')
  bymonthday?: string; // 월 일자 조건 (ex: '1,15,-1')
  bymonth?: string; // 월 조건 (ex: '1,6,12')
  byyearday?: string; // 연간 일자 조건 (ex: '100,200')
  bysetpos?: number; // 정렬된 결과 중 몇 번째 (ex: 1, 2, -1)
  dtstart?: string; // 반복 시작일 (YYYY-MM-DD)
  until?: string; // 반복 종료일 (YYYY-MM-DD)
  count?: number; // 반복 횟수
  repeatEndType?: RepeatEndTypes; // 반복 종료 유형
};

export enum PlanVisibilityTypes {
  PRIVATE = "private", // 본인만 보기
  ATTENDEES = "attendees", // 참석자만 보기
  DEPARTMENT = "department", // 부서 공개
  DIVISION = "division", // 본부 공개
  PUBLIC = "public", // 전체 조직 공개
}

export enum PlanTypes {
  SCHEDULE = "schedule",
  TASK = "task",
  DAYOFF = "dayoff",
  BOOKING = "booking",
  ZOOM = "zoom",
  HOLIDAY = "holiday",
}

export type ScheduleType = PlanType & {
  scheduleIdx?: number;
  planIdx?: number;
  location?: string;
  joinEmpNo?: string;
  joinDeptCd?: string;
  joinThirdParty?: string;
};

export enum RepeatTypes {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  NONE = "NONE",
}

export enum RepeatEndTypes {
  NEVER = "never",
  COUNT = "count",
  UNTIL = "until",
}

export type TaskType = PlanType & {
  taskIdx?: number;
  isAllday?: boolean;
};

export type DayoffType = PlanType & {
  dayoffIdx?: number;
  offType?: OffTypes;
  halfOff?: HalfOffTypes;
  offDays?: number;
};

export enum OffTypes {
  GENERAL = "general", //일반 연차
  OCCASION = "occasion", //경조사
  OFFICIAL = "official", //공가
  SICK = "sick", //병가
}

export enum HalfOffTypes {
  NONE = "none",
  MORNING_OFF = "morningOff", // 오전 반차
  AFTERNOON_OFF = "afternoonOff", // 오후 반차
}

export type BookingType = PlanType & {
  bookingIdx?: number;
  usingPurpose?: string;
  resourceType?: ResourceTypes;
};

export enum ResourceTypes {
  MEETING_ROOM = "meeting-room", //회의실
  TOOL = "tool", //도구
}

export type PublicHolidayType = PlanType & {
  dateKind?: number;
  dateName?: string;
  isHoliday?: string;
  locdate?: string;
  seq?: number;
};

/*************************** 타입 가드 함수 ***************************/
export const isSchedule = (plan: PlanType): plan is ScheduleType => {
  return plan.planType === PlanTypes.SCHEDULE;
};
export const isTask = (plan: PlanType): plan is TaskType => {
  return plan.planType === PlanTypes.TASK;
};
export const isDayoff = (plan: PlanType): plan is DayoffType => {
  return plan.planType === PlanTypes.DAYOFF;
};
export const isBooking = (plan: PlanType): plan is BookingType => {
  return plan.planType === PlanTypes.BOOKING;
};

type PlanCommonType = {
  selected?: number;
  mode: ModeType;
};

export type PlanMenuStateType = PlanCommonType & {
  planMenu: SideBarMenuType;
};

export type PlanStateType = PlanCommonType & {
  plan: PlanType;
};

export type ScheduleStateType = PlanCommonType & {
  schedule: ScheduleType;
};

export type TaskStateType = PlanCommonType & {
  task: TaskType;
};

export type DayoffStateType = PlanCommonType & {
  dayoff: DayoffType;
};

export type BookingStateType = PlanCommonType & {
  booking: BookingType;
};

export type RepeatRuleStateType = PlanCommonType & {
  repeatRule: RepeatRuleType;
};

/*************************** 기타 ***************************/

export type DateTimeRangeType = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

export type DateTimeType = {
  startDate: string;
  startTime: string;
};

export const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

// 반복 종료 옵션
export const period = [
  {label: "계속", value: RepeatEndTypes.NEVER},
  {label: "횟수", value: RepeatEndTypes.COUNT},
  {label: "특정일", value: RepeatEndTypes.UNTIL},
];

export const planTypeMap: Record<PlanTypes, string> = {
  [PlanTypes.SCHEDULE]: "일정",
  [PlanTypes.TASK]: "업무",
  [PlanTypes.BOOKING]: "예약",
  [PlanTypes.DAYOFF]: "휴가",
  [PlanTypes.ZOOM]: "줌",
  [PlanTypes.HOLIDAY]: "공휴일",
};

export type EventType = {
  id?: string | number;
  groupId?: string;
  allDay?: boolean;
  isRepeated?: boolean;
  repeatRule?: RepeatRuleType;
  start: Date | string;
  end?: Date | string;
  title: string;
  url?: string;
  className?: string | string[];
  editable?: boolean;
  startEditable?: boolean;
  durationEditable?: boolean;
  resourceEditable?: boolean;
  rendering?: "background" | "inverse-background";
  overlap?: boolean;
  constraint?: any;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: Record<string, any>; // 추가 데이터는 여기에!
};
