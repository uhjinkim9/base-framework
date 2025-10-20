import { Expose, Transform } from 'class-transformer';
import { PlanTypes, PlanVisibilityTypes } from '../../etc/plan.enum';
import { RepeatRuleResDto } from './repeat-rule.res-dto';
import { PlanMenuResDto } from '../../../plan-menu/dto/res/plan-menu.res-dto';
import { ScheduleResDto } from './schedule.res-dto';

export class PlanResDto {
  @Expose()
  planIdx: number;

  @Expose()
  planType: PlanTypes;

  @Expose()
  menuIdx?: number;

  @Expose()
  title: string;

  @Expose()
  visibility: PlanVisibilityTypes;

  @Expose()
  @Transform(({ value }) => value === 1)
  isAllday: boolean;

  @Expose()
  @Transform(({ value }) => value === 1)
  isRepeated: boolean;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  startedAt?: string;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  endedAt?: string;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  createdAt?: Date;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  updatedAt?: Date;

  @Expose()
  calendar?: PlanMenuResDto;

  @Expose()
  schedule?: ScheduleResDto;

  @Expose()
  repeatRule?: RepeatRuleResDto;
}
