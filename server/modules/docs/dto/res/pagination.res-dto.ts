import { Expose } from 'class-transformer';
import { DocResDto } from './doc.res-dto';

export class PaginationResDto {
  @Expose()
  nextPage?: number;

  @Expose()
  previousPage?: number;

  @Expose()
  totalPage: number;

  @Expose()
  results: DocResDto[];
}
