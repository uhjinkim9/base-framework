import { Expose, Transform } from 'class-transformer';

export class ScheduleResDto {
  @Expose()
  scheduleIdx: number;

  @Expose()
  planIdx: number;

  @Expose()
  memo?: string;

  @Expose()
  location?: string;

  @Expose()
  joinEmpNo?: string;

  @Expose()
  joinDeptCd?: string;

  @Expose()
  joinThirdParty?: string;

  @Expose()
  @Transform(({ value }) => value === 1)
  isRepeated: boolean;
}
