import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Between, DataSource, In, Repository} from "typeorm";
import {plainToInstance} from "class-transformer";

import {Result} from "src/common/util/result";
import {isValidPlanType, relationMap} from "../etc/plan-helper";
import {PlanTypes} from "../etc/plan.enum";

import {DayoffReqDto} from "../dto/req-dto/dayoff.req-dto";
import {PlanReqDto} from "../dto/req-dto/plan.req-dto";
import {RepeatRuleReqDto} from "../dto/req-dto/repeat-rule.req-dto";
import {ScheduleReqDto} from "../dto/req-dto/schedule.req-dto";
import {TaskReqDto} from "../dto/req-dto/task.req-dto";
import {DayoffEntity} from "../entity/dayoff.entity";
import {PlanEntity} from "../entity/plan.entity";
import {RepeatRuleEntity} from "../entity/repeat-rule.entity";
import {ScheduleEntity} from "../entity/schedule.entity";
import {TaskEntity} from "../entity/task.entity";
import {PlanResDto} from "../dto/res-dto/plan.res-dto";

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly planRepo: Repository<PlanEntity>,
    @InjectRepository(RepeatRuleEntity)
    private readonly rrRepo: Repository<RepeatRuleEntity>,
    @InjectRepository(ScheduleEntity)
    private readonly scheRepo: Repository<ScheduleEntity>,
    @InjectRepository(DayoffEntity)
    private readonly dayoffRepo: Repository<DayoffEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepo: Repository<TaskEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async getPlans(range: string): Promise<Result<any>> {
    const startDateStr = range?.split("~")[0];
    const endDateStr = range?.split("~")[1];
    const startDate = startDateStr
      ? dayjs.utc(startDateStr).toISOString()
      : undefined;
    const endDate = endDateStr
      ? dayjs.utc(endDateStr).toISOString()
      : undefined;

    try {
      const plans = await this.planRepo.find({
        where: {startedAt: Between(startDate, endDate)},
        relations: ["planMenu", "repeatRule"],
      });

      const res = plainToInstance(PlanResDto, plans);
      return Result.success(res, "범위 내 일정이 조회되었습니다.");
    } catch (err) {
      return Result.error(HttpStatus.BAD_REQUEST, "쿼리 실행 실패");
    }
  }

  async getPlan(plan: PlanReqDto): Promise<Result<PlanResDto>> {
    const {planIdx} = plan;
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const plan = await qr.manager.findOne(this.planRepo.target, {
        where: {planIdx},
        select: {
          planIdx: true,
          planType: true,
        },
      });

      const planType = plan.planType;
      const relations = relationMap[planType];

      const result = await this.planRepo.findOne({
        where: {planIdx},
        relations,
      });

      const res = plainToInstance(PlanResDto, result);
      await qr.commitTransaction();
      return Result.success(res, "쿼리 실행 완료");
    } catch (err) {
      await qr.rollbackTransaction();
      return Result.error(HttpStatus.BAD_REQUEST, "쿼리 실행 실패, 롤백");
    } finally {
      await qr.release();
    }
  }

  // 통합된 Plan 생성 메서드
  async createOrUpdatePlan(
    planDto: PlanReqDto,
    repeatRuleDto: RepeatRuleReqDto,
    typeSpecificDto: ScheduleReqDto | TaskReqDto | DayoffReqDto,
    planType: PlanTypes,
  ): Promise<Result<any>> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // 1. Plan 저장 - DTO를 Entity로 변환
      const planEntity = plainToInstance(PlanEntity, planDto);
      const plan = await qr.manager.save(planEntity);
      const {menuIdx, planIdx} = plan;

      // 3. 타입별 데이터 저장
      let typeSpecificResult;
      let typeSpecificKey;

      switch (planType) {
        case PlanTypes.SCHEDULE:
          const scheduleEntity = plainToInstance(ScheduleEntity, {
            ...typeSpecificDto,
            planIdx,
          });
          typeSpecificResult = await qr.manager.save(scheduleEntity);
          typeSpecificKey = "schedule";
          break;

        case PlanTypes.TASK:
          const taskEntity = plainToInstance(TaskEntity, {
            ...typeSpecificDto,
            planIdx,
          });
          typeSpecificResult = await qr.manager.save(taskEntity);
          typeSpecificKey = "task";
          break;

        case PlanTypes.DAYOFF:
          const dayoffEntity = plainToInstance(DayoffEntity, {
            ...typeSpecificDto,
            planIdx,
          });
          typeSpecificResult = await qr.manager.save(dayoffEntity);
          typeSpecificKey = "dayoff";
          break;

        default:
          throw new Error(`지원하지 않는 계획 타입: ${planType}`);
      }

      // 4. RepeatRule 저장 (선택적)
      const rrule = repeatRuleDto
        ? await qr.manager.save(
            plainToInstance(RepeatRuleEntity, {
              ...repeatRuleDto,
              planIdx,
            }),
          )
        : null;

      // 5. 결과 병합
      const merged = {
        ...plan,
        [typeSpecificKey]: typeSpecificResult,
        repeatRule: rrule,
      };

      await qr.commitTransaction();
      return Result.success({plan: merged}, `${planType} 생성 완료`);
    } catch (error) {
      await qr.rollbackTransaction();
      return Result.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `${planType} 생성 중 오류 발생: ${error.message}`,
      );
    } finally {
      await qr.release();
    }
  }

  // 레거시 메서드들 (기존 API 호환성을 위해 유지)
  async createSchedule(
    planDto: PlanReqDto,
    repeatRuleDto: RepeatRuleReqDto,
    scheduleDto: ScheduleReqDto,
  ): Promise<Result<any>> {
    return this.createOrUpdatePlan(
      planDto,
      repeatRuleDto,
      scheduleDto,
      PlanTypes.SCHEDULE,
    );
  }

  async createTask(
    planDto: PlanReqDto,
    repeatRuleDto: RepeatRuleReqDto,
    taskDto: TaskReqDto,
  ): Promise<Result<any>> {
    return this.createOrUpdatePlan(
      planDto,
      repeatRuleDto,
      taskDto,
      PlanTypes.TASK,
    );
  }

  async createDayoff(
    plan: PlanReqDto,
    repeatRule: RepeatRuleReqDto,
    dayoff: DayoffReqDto,
  ): Promise<Result<any>> {
    return this.createOrUpdatePlan(plan, repeatRule, dayoff, PlanTypes.DAYOFF);
  }

  // // Booking 생성 (미래용)
  // async createBooking(
  //   plan: PlanReqDto,
  //   repeatRule: RepeatRuleReqDto,
  //   booking: BookingReqDto,
  // ): Promise<any> {
  //   const planRes = await this.planRepo.save(plan);
  //   const { planIdx } = planRes;
  //   const bookingRes = await this.bookingRepo.save({ ...booking, planIdx });
  //   const rrule = await this.rrRepo.save({ ...repeatRule, planIdx });

  //   return Result.success(
  //     { planRes, bookingRes, rrule },
  //     'Booking 생성 완료',
  //   );
  // }

  // plan 삭제
  async deletePlan(planIdx: number): Promise<Result<any>> {
    const deleteMap = {
      [PlanTypes.SCHEDULE]: {
        repo: this.scheRepo,
        entityName: "SCHEDULE",
      },
      [PlanTypes.TASK]: {
        repo: this.taskRepo,
        entityName: "TASK",
      },
      [PlanTypes.DAYOFF]: {
        repo: this.dayoffRepo,
        entityName: "DAYOFF",
      },
    };

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // 1. Plan 조회 및 삭제
      const plan = await qr.manager.findOne(this.planRepo.target, {
        where: {planIdx},
        select: {
          planIdx: true,
          planType: true,
        },
      });

      const planType = plan.planType;
      const deleteConfig = deleteMap[planType];

      // 2. 타입별 엔티티 조회 및 삭제
      const typeSpecificEntity = await qr.manager.findOne(
        deleteConfig.repo.target,
        {
          where: {planIdx},
        },
      );

      // 3. 관련 데이터 삭제 (순서 중요: 외래키 제약 조건)
      await qr.manager.delete(deleteConfig.repo.target, {planIdx});
      await qr.manager.delete(RepeatRuleEntity, {planIdx});
      await qr.manager.remove(plan);

      await qr.commitTransaction();
      return Result.success(typeSpecificEntity, "일정이 삭제되었습니다.");
    } catch (error) {
      await qr.rollbackTransaction();
      return Result.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `일정 삭제 중 오류 발생: ${error.message}`,
      );
    } finally {
      await qr.release();
    }
  }

  /**
   * 공휴일 API 프록시 메서드
   * CORS 문제를 해결하기 위해 서버에서 공공데이터포털 API를 호출
   */
  async getPublicHolidays(year: number, month: number): Promise<Result<any>> {
    //   try {
    //     const holidayData = await fetchPublicHolidays(year, month);
    //     return Result.success(
    //       holidayData,
    //       "공휴일 정보를 성공적으로 조회했습니다.",
    //     );
    //   } catch (error) {
    //     console.error(
    //       "[PlanService.getPublicHolidays] 공휴일 데이터 조회 실패:",
    //       {
    //         message: error instanceof Error ? error.message : String(error),
    //       },
    //     );
    return Result.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `공휴일 정보 조회 실패`,
    );
    //   }
  }
}
