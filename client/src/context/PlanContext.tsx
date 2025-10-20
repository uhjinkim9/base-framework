"use client";
import {createContext, useContext, useReducer, useState} from "react";

import {
  CheckedCalType,
  PlanStateType,
  PlanType,
  ScheduleStateType,
  TaskStateType,
  RepeatRuleStateType,
  DayoffStateType,
} from "@/types/plan.type";
import {
  DayoffActionType,
  dayoffReducer,
  planReducer,
  RepeatRuleActionType,
  rrReducer,
  scheduleReducer,
  taskReducer,
  // , bookingReducer도 필요하면 추가
} from "@/reducers/plan.reducer";
import {
  initialCheckedCalList,
  initialDayoffState,
  initialPlanState,
  initialRepeatRuleState,
  initialScheduleState,
  initialTaskState,
  // , initialBookingState도 필요하면 추가
} from "@/reducers/etc/plan-initial-state";
import {
  PlanActionType,
  ScheduleActionType,
  TaskActionType,
  // , BookingActionType도 필요하면 추가
} from "@/reducers/plan.reducer";
import {SideBarMenuSortType} from "@/types/menu.type";

const PlanContext = createContext<{
  // 캘린더에 렌더링될 Plans
  plans: PlanType[];
  setPlans: React.Dispatch<React.SetStateAction<PlanType[]>>;

  // 체크된 캘린더
  checkedCalList: CheckedCalType[];
  setIsCheckedCalList: React.Dispatch<React.SetStateAction<CheckedCalType[]>>;

  // 사이드바 메뉴
  planMenus: SideBarMenuSortType;
  setPlanMenus: React.Dispatch<React.SetStateAction<SideBarMenuSortType>>;

  // 각 도메인별 상태들 (reducer 사용)
  planState: PlanStateType;
  planDispatch: React.Dispatch<PlanActionType>;

  scheduleState: ScheduleStateType;
  scheduleDispatch: React.Dispatch<ScheduleActionType>;

  taskState: TaskStateType;
  taskDispatch: React.Dispatch<TaskActionType>;

  dayoffState: DayoffStateType;
  dayoffDispatch: React.Dispatch<DayoffActionType>;

  repeatRuleState: RepeatRuleStateType;
  repeatRuleDispatch: React.Dispatch<RepeatRuleActionType>;

  // dayoffState: DayoffStateType;
  // dayoffDispatch: React.Dispatch<DayoffActionType>;

  // bookingState: BookingState;
  // bookingDispatch: React.Dispatch<BookingActionType>;
} | null>(null);

export const PlanProvider = ({children}: {children: React.ReactNode}) => {
  const [plans, setPlans] = useState<PlanType[]>([]); // planType: dayoff, schedule, booking 등
  const [checkedCalList, setIsCheckedCalList] = useState<CheckedCalType[]>(
    initialCheckedCalList,
  );
  const [planMenus, setPlanMenus] = useState<SideBarMenuSortType>(undefined);

  // 각 도메인별 reducer 설정
  const [planState, planDispatch] = useReducer(planReducer, initialPlanState);
  const [scheduleState, scheduleDispatch] = useReducer(
    scheduleReducer,
    initialScheduleState,
  );
  const [taskState, taskDispatch] = useReducer(taskReducer, initialTaskState);
  const [dayoffState, dayoffDispatch] = useReducer(
    dayoffReducer,
    initialDayoffState,
  );
  const [repeatRuleState, repeatRuleDispatch] = useReducer(
    rrReducer,
    initialRepeatRuleState,
  );
  // const [bookingState, bookingDispatch] = useReducer(bookingReducer, initialBookingState);

  return (
    <PlanContext.Provider
      value={{
        plans,
        setPlans,
        checkedCalList,
        setIsCheckedCalList,
        planMenus,
        setPlanMenus,
        planState,
        planDispatch,
        scheduleState,
        scheduleDispatch,
        taskState,
        taskDispatch,
        repeatRuleState,
        repeatRuleDispatch,
        dayoffState,
        dayoffDispatch,
        // bookingState,
        // bookingDispatch,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlanContext = () => {
  const context = useContext(PlanContext);
  if (!context) throw new Error("PlanProvider가 누락되었습니다.");
  return context;
};
