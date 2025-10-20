import { Expose } from 'class-transformer';
import { HalfOffTypes, OffTypes } from '../../etc/plan.enum';

export class DayoffResDto {
  @Expose()
  dayoffIdx: number;

  @Expose()
  planIdx: number;

  @Expose()
  memo?: string;

  @Expose()
  offType: OffTypes;

  @Expose()
  halfOff?: HalfOffTypes;

  @Expose()
  offDays: number;
}