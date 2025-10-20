"use client";
import {ModeType} from "@/types/common.type";
import {
  BookingType,
  DayoffStateType,
  DayoffType,
  PlanStateType,
  PlanType,
  RepeatRuleStateType,
  RepeatRuleType,
  ScheduleStateType,
  ScheduleType,
  TaskStateType,
  TaskType,
} from "@/types/plan.type";
import {
  initialDayoffState,
  initialPlanState,
  initialRepeatRuleState,
  initialScheduleState,
  initialTaskState,
} from "./etc/plan-initial-state";

/** 설명
 * TState: 리듀서가 관리하는 전체 상태의 타입
 * TEntity: 상태 내에서 관리되는 핵심 엔티티 데이터의 타입
 *
 * 런타임에서 동적 변환을 위해 entityKey는 TState의 키 중 하나여야 한다.
 * 예를 들어, "planMenu", "plan" 등.
 *
 * TState 안에 TEntity가 포함된다.
 */
// 공통 액션 타입 생성기
type BaseActionType<TEntity, TEntityKey extends string> =
  | {type: `SET_${Uppercase<TEntityKey>}`; payload: TEntity}
  | {
      type: `UPDATE_${Uppercase<TEntityKey>}_FIELD`;
      payload: {name: keyof TEntity; value: any};
    }
  | {
      type: `UPDATE_${Uppercase<TEntityKey>}_FIELDS`;
      payload?: Partial<TEntity>;
    }
  | {type: "SET_SELECTED"; payload: number | string}
  | {type: "SET_MODE"; payload: ModeType}
  | {type: "RESET"; payload?: any};

// 각 도메인별 액션 타입 정의
export type PlanActionType = BaseActionType<PlanType, "PLAN">;
export type ScheduleActionType = BaseActionType<ScheduleType, "SCHEDULE">;
export type TaskActionType = BaseActionType<TaskType, "TASK">;
export type DayoffActionType = BaseActionType<DayoffType, "DAYOFF">;
export type BookingActionType = BaseActionType<BookingType, "BOOKING">;
export type RepeatRuleActionType = BaseActionType<
  RepeatRuleType,
  "REPEAT_RULE"
>;

// 공통 리듀서 생성기
// TState에서 TEntity 타입을 가진 키만 허용하는 타입
type EntityKeyOf<TState, TEntity> = {
  [K in keyof TState]: TState[K] extends TEntity ? K : never;
}[keyof TState];

function createReducer<TState, TEntity>(
  entityKey: EntityKeyOf<TState, TEntity>,
  upperEntityKey: string,
  initialState: TState,
) {
  return function reducer(
    state: TState,
    action: BaseActionType<TEntity, string>,
  ): TState {
    console.log(`🚀 ${upperEntityKey} Reducer:`, action.type, action.payload);

    switch (action.type) {
      case `SET_${upperEntityKey}`:
        return {
          ...state,
          [entityKey]: action.payload,
        };

      case `UPDATE_${upperEntityKey}_FIELD`:
        console.log(
          `🔧 Updating ${String(entityKey)}.${String(action.payload.name)} =`,
          action.payload.value,
        );
        return {
          ...state,
          [entityKey]: {
            ...(state[entityKey] as any),
            [action.payload.name]: action.payload.value,
          },
        };

      case `UPDATE_${upperEntityKey}_FIELDS`:
        return {
          ...state,
          ...action.payload,
        };

      case "SET_SELECTED":
        return {
          ...state,
          selected: action.payload,
        } as TState;

      case "SET_MODE":
        return {
          ...state,
          mode: action.payload,
        } as TState;

      case "RESET":
        return {
          ...initialState,
        };

      default:
        return state;
    }
  };
}

// 각 도메인별 리듀서 생성
export const planReducer = createReducer<PlanStateType, PlanType>(
  "plan",
  "PLAN",
  initialPlanState,
);

export const scheduleReducer = createReducer<ScheduleStateType, ScheduleType>(
  "schedule",
  "SCHEDULE",
  initialScheduleState,
);

export const taskReducer = createReducer<TaskStateType, TaskType>(
  "task",
  "TASK",
  initialTaskState,
);

export const dayoffReducer = createReducer<DayoffStateType, DayoffType>(
  "dayoff",
  "DAYOFF",
  initialDayoffState,
);

export const rrReducer = createReducer<RepeatRuleStateType, RepeatRuleType>(
  "repeatRule",
  "REPEAT_RULE",
  initialRepeatRuleState,
);
