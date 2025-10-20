import {HttpStatus, Injectable, Logger} from "@nestjs/common";
import {
  Cron,
  CronExpression,
  Interval,
  SchedulerRegistry,
  Timeout,
} from "@nestjs/schedule";
import {InjectRepository} from "@nestjs/typeorm";
import {plainToInstance} from "class-transformer";
import {DataSource, Repository} from "typeorm";

import {Result} from "common/util/result";

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    // @InjectRepository(EmployeeEntity)
    // private empRepo: Repository<EmployeeEntity>,

    private schedulerRegistry: SchedulerRegistry, // 메모리 안에서만 존재
    private dataSource: DataSource, // 직접 QueryRunner 쓰거나 Raw 쿼리용
  ) {}

  async syncEmpsFromErp() {
    this.logger.log("[AUTH] syncEmpsFromErp - ERP 직원 동기화 시작");

    // const qr = this.dataSource.createQueryRunner();
    // await qr.connect();
    // await qr.startTransaction();
    // try {
    //   // userId가 유효한 직원만 필터링 (PRIMARY KEY 검증)
    //   const employees = erpRawResponse.filter(
    //     (emp) => emp.userId && emp.userId.trim() !== "",
    //   );

    //   this.logger.log(
    //     `필터링 전: ${erpRawResponse?.length || 0}개, 필터링 후: ${employees.length}개`,
    //   );

    //   // employee 테이블에 저장
    //   const savedEmployees = await qr.manager.save(
    //     this.empRepo.target,
    //     employees,
    //   );
    //   const res = plainToInstance(EmployeeResDto, savedEmployees);

    //   await qr.commitTransaction(); // 트랜잭션 커밋
    //   this.logger.log("[AUTH] syncEmpsFromErp - ERP 직원 동기화 완료");
    //   return Result.success(res, "ERP 직원 동기화 완료");
    // } catch (err) {
    //   await qr.rollbackTransaction();
    //   this.logger.error("[AUTH] 동기화 실패:", err);
    //   return Result.error(
    //     HttpStatus.BAD_REQUEST,
    //     "[AUTH] syncEmpsFromErp 쿼리 실행 실패, 롤백",
    //   );
    // } finally {
    //   await qr.release();
    // }
  }
}
