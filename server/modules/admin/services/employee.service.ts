import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {plainToInstance} from "class-transformer";

import {Result} from "src/common/util/result";
import {partialDto} from "src/common/util/partial-dto";

import {EmployeeEntity} from "../entities/employee.entity";
import {EmployeeResDto} from "../dto/res/employee.res-dto";
import {PaginationReqDto} from "../dto/req/pagination.req-dto";
import {PaginationResDto} from "../dto/res/pagination.res-dto";
import {PaginationHelper} from "src/helpers/pagination.helper";
import {addSearchCondition} from "src/helpers/contact-helper";

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly empRepo: Repository<EmployeeEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async getPaginatedEmployees(
    dto: PaginationReqDto,
  ): Promise<Result<PaginationResDto>> {
    const {menuId, page, limit, searchKeyword, searchCategory, payload} = dto;
    const paginationOptions = PaginationHelper.validatePaginationOptions(
      page,
      limit,
    );

    let results: any[] = [];
    let total = 0;

    // const partial = partialDto(dto);

    const empQuery = this.empRepo
      .createQueryBuilder("emp")
      .where("1=1")
      .orderBy("emp.workPeriod", "DESC");
    const empCountQuery = this.empRepo
      .createQueryBuilder("emp")
      .where("1=1")
      .orderBy("emp.workPeriod", "DESC");

    if (searchKeyword?.trim()) {
      addSearchCondition(empQuery, searchKeyword, searchCategory);
    }
    if (searchKeyword?.trim()) {
      addSearchCondition(empCountQuery, searchKeyword, searchCategory);
    }

    [results, total] = await PaginationHelper.executeParallel(
      empQuery,
      empCountQuery,
      paginationOptions,
    );

    // 페이지네이션 응답 생성
    const paginationResult = PaginationHelper.createPaginationResult(
      results,
      total,
      paginationOptions,
    );

    const response: PaginationResDto = {
      nextPage: paginationResult.nextPage,
      previousPage: paginationResult.previousPage,
      totalPage: paginationResult.totalPage,
      results: paginationResult.data,
    };

    return Result.success(response, "사용자 목록을 조회했습니다.");
  }
}
