import {Controller, Post, Body} from "@nestjs/common";

import {Result} from "src/common/util/result";

import {EmployeeReqDto} from "../dto/req/employee.req-dto";
import {EmployeeResDto} from "../dto/res/employee.res-dto";
import {EmployeeService} from "../services/employee.service";
import {PaginationReqDto} from "../dto/req/pagination.req-dto";
import {PaginationResDto} from "../dto/res/pagination.res-dto";

@Controller("auth")
export class EmployeeController {
  constructor(private readonly empSvc: EmployeeService) {}

  @Post("/getPaginatedEmployees")
  async getPaginatedEmployees(
    @Body() dto: PaginationReqDto,
  ): Promise<Result<PaginationResDto>> {
    return await this.empSvc.getPaginatedEmployees(dto);
  }
}
