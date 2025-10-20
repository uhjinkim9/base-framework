import { Expose } from 'class-transformer';
import { RepeatEndTypes, RepeatTypes } from '../../etc/plan.enum';

export class RepeatRuleResDto {
  @Expose()
  idx: number;

  @Expose()
  planIdx: number;

  @Expose()
  freq?: RepeatTypes;

  @Expose()
  interval?: number;

  @Expose()
  byweekday?: string; // ex: 'MO,TU,FR'

  @Expose()
  bymonthday?: string; // ex: '1,15,-1'

  @Expose()
  bymonth?: string; // ex: '1,6,12'

  @Expose()
  byyearday?: string; // ex: '100,200'

  @Expose()
  bysetpos?: number;

  @Expose()
  dtstart?: string; // ex: '2025-06-01'

  @Expose()
  until?: string; // ex: '2025-12-31'

  @Expose()
  count?: number;

  @Expose()
  repeatEndType?: RepeatEndTypes;
}
