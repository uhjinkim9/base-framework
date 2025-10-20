import { Expose, Transform } from 'class-transformer';

export class TaskResDto {
  @Expose()
  taskIdx: number;

  @Expose()
  planIdx: number;

  @Expose()
  memo?: string;

  @Expose()
  @Transform(({ value }) => value === 1)
  isAllday: boolean;
}
