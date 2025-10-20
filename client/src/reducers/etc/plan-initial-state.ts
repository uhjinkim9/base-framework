import {
  PlanStateType,
  ScheduleStateType,
  TaskStateType,
  HalfOffTypes,
  OffTypes,
  PlanTypes,
  PlanVisibilityTypes,
  CheckedCalType,
  PlanMenuStateType,
  RepeatRuleStateType,
  RepeatEndTypes,
  DayoffStateType,
} from "@/types/plan.type";
import {LocalStorage} from "@/util/common/storage";

export const initialPlanState: PlanStateType = {
  selected: undefined,
  mode: "view",
  plan: {
    planType: PlanTypes.SCHEDULE,
    title: "",
    menuIdx: "0",
    visibility: PlanVisibilityTypes.PRIVATE,
    startedAt: "",
    endedAt: "",
    isAllday: false,
    isRepeated: false,
  },
};

export const initialScheduleState: ScheduleStateType = {
  selected: undefined,
  mode: "view",
  schedule: {
    menuIdx: undefined,
    planIdx: undefined,
    scheduleIdx: undefined,
    title: "",
    location: undefined,
    joinEmpNo: undefined,
    joinThirdParty: undefined,
    startedAt: "",
    endedAt: "",
    isAllday: false,
    isRepeated: false,
  },
};

export const initialTaskState: TaskStateType = {
  selected: undefined,
  mode: "view",
  task: {
    menuIdx: undefined,
    planIdx: undefined,
    taskIdx: undefined,
    title: "",
    startedAt: "",
    endedAt: "",
    isAllday: false,
    isRepeated: false,
  },
};

export const initialDayoffState: DayoffStateType = {
  selected: undefined,
  mode: "view",
  dayoff: {
    menuIdx: undefined,
    planIdx: undefined,
    title: "",
    startedAt: "",
    endedAt: "",
    isAllday: false,
    isRepeated: false,
    dayoffIdx: undefined,
    offType: OffTypes.GENERAL,
    halfOff: HalfOffTypes.NONE,
    offDays: 1,
  },
};

export const initialRepeatRuleState: RepeatRuleStateType = {
  selected: undefined,
  mode: "view",
  repeatRule: {
    idx: undefined,
    planIdx: undefined,
    freq: undefined,
    interval: 1,
    byweekday: undefined,
    bymonthday: undefined,
    bymonth: undefined,
    byyearday: undefined,
    bysetpos: undefined,
    dtstart: undefined,
    until: undefined,
    count: 0,
    repeatEndType: RepeatEndTypes.NEVER,
  },
};

export const initialCheckedCalList: CheckedCalType[] =
  LocalStorage.getItem("checkedCalList") ?? [];
