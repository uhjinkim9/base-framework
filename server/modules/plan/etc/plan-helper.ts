import {PlanTypes} from "./plan.enum";

// planType 유효성 검사
export const validPlanTypes = [
  PlanTypes.SCHEDULE,
  PlanTypes.TASK,
  PlanTypes.DAYOFF,
];

export const isValidPlanType = (planType: string): boolean => {
  return validPlanTypes.includes(planType as PlanTypes);
};

// planType에 따른 TypeORM 관계 매핑
export const relationMap = {
  [PlanTypes.SCHEDULE]: ["planMenu", "schedule", "repeatRule"],
  [PlanTypes.DAYOFF]: ["planMenu", "dayoff", "repeatRule"],
  [PlanTypes.TASK]: ["planMenu", "task", "repeatRule"],
};
