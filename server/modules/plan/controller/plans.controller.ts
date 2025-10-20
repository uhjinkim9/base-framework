import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Get,
  Query,
} from "@nestjs/common";
import {plainToInstance} from "class-transformer";

import {Result} from "src/common/util/result";
import {PlanService} from "../service/plan.service";

import {PlanTypes} from "../etc/plan.enum";
import {TaskReqDto} from "../dto/req-dto/task.req-dto";
import {PlanReqDto} from "../dto/req-dto/plan.req-dto";
import {RepeatRuleReqDto} from "../dto/req-dto/repeat-rule.req-dto";
import {ScheduleReqDto} from "../dto/req-dto/schedule.req-dto";
import {DayoffReqDto} from "../dto/req-dto/dayoff.req-dto";

@Controller("plan")
export class PlansController {
  constructor(private readonly planSvc: PlanService) {}

  /*************************** plan ***************************/
  @Post("/getPlans")
  async getPlans(@Body() obj: {range: string}): Promise<Result<any>> {
    return await this.planSvc.getPlans(obj.range);
  }

  @Post("/getPlan")
  async getPlan(@Body() plan: PlanReqDto): Promise<Result<any>> {
    return await this.planSvc.getPlan(plan);
  }

  @Post("/createOrUpdatePlan")
  async createOrUpdatePlan(@Body() body: any): Promise<Result<any>> {
    const {
      plan,
      data,
      repeatRule,
    }: {plan: PlanReqDto; data: any; repeatRule?: RepeatRuleReqDto} = body;

    // planType에 따른 DTO 매핑 및 서비스 메서드 매핑
    const planTypeMap = {
      [PlanTypes.SCHEDULE]: {
        dtoClass: ScheduleReqDto,
        dataKey: "schedule",
        serviceMethod: "createSchedule",
      },
      [PlanTypes.TASK]: {
        dtoClass: TaskReqDto,
        dataKey: "task",
        serviceMethod: "createTask",
      },
      [PlanTypes.DAYOFF]: {
        dtoClass: DayoffReqDto,
        dataKey: "dayoff",
        serviceMethod: "createDayoff",
      },
    };

    const planConfig = planTypeMap[plan.planType];
    if (!planConfig) {
      return Result.error(
        HttpStatus.BAD_REQUEST,
        `올바르지 않은 계획 타입입니다: ${plan.planType}`,
      );
    }

    try {
      // body에서 해당 타입의 데이터 추출 (dataKey 사용) 또는 data 직접 사용
      const planData = body[planConfig.dataKey] || data;
      const planObj = plainToInstance(planConfig.dtoClass, planData);

      // 동적으로 서비스 메서드 호출
      return await this.planSvc[planConfig.serviceMethod](
        plan,
        repeatRule,
        planObj,
      );
    } catch (error) {
      return Result.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "일정 생성 중 오류가 발생했습니다.",
      );
    }
  }

  @Post("/deletePlan")
  async deletePlan(@Body() dto: PlanReqDto): Promise<Result<any>> {
    const {planIdx} = dto;
    if (!planIdx) {
      return Result.error(HttpStatus.BAD_REQUEST, "일정 ID 필요");
    }

    try {
      return await this.planSvc.deletePlan(planIdx);
    } catch (error) {
      return Result.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "일정 삭제 중 오류가 발생했습니다.",
      );
    }
  }

  /*************************** 공휴일 API 프록시 ***************************/
  @Post("/getPublicHolidays")
  async getPublicHolidays(@Body() body: {year: number; month: number}): Promise<Result<any>> {
    const {year, month} = body;
    
    if (!year || !month) {
      return Result.error(HttpStatus.BAD_REQUEST, "년도와 월 정보가 필요합니다.");
    }

    try {
      return await this.planSvc.getPublicHolidays(year, month);
    } catch (error) {
      return Result.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "공휴일 정보 조회 중 오류가 발생했습니다.",
      );
    }
  }
}
