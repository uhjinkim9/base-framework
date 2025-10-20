import {Expose} from "class-transformer";
import {EmployeeResDto} from "./employee.res-dto";

export class PaginationResDto {
  @Expose()
  nextPage?: number;

  @Expose()
  previousPage?: number;

  @Expose()
  totalPage: number;

  @Expose()
  results: EmployeeResDto[];
}
