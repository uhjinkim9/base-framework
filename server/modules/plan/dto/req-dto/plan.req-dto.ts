import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsISO8601,
  IsDate,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

import { PlanTypes, PlanVisibilityTypes } from '../../etc/plan.enum';
import { PlanMenuReqDto } from '../../../plan-menu/dto/req/plan-menu.req-dto';
import { RepeatRuleResDto } from '../res-dto/repeat-rule.res-dto';
import { ScheduleReqDto } from './schedule.req-dto';
import { DayoffReqDto } from './dayoff.req-dto';
import { TaskReqDto } from './task.req-dto';

export class PlanDto {
  @IsInt()
  planIdx: number;

  @IsOptional()
  @IsEnum(PlanTypes)
  planType: PlanTypes;

  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  @IsInt()
  menuIdx?: number;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsEnum(PlanVisibilityTypes)
  visibility: PlanVisibilityTypes;

  @Transform(({ value }) => (value ? 1 : 0))
  @IsOptional()
  @IsInt()
  isAllday: number;

  @Transform(({ value }) => (value ? 1 : 0))
  @IsOptional()
  @IsInt()
  isRepeated: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? new Date(value) : undefined,
  )
  @IsISO8601()
  startedAt?: Date;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? new Date(value) : undefined,
  )
  @IsISO8601()
  endedAt?: Date;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? new Date(value) : undefined,
  )
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? new Date(value) : undefined,
  )
  @IsDate()
  updatedAt?: Date;

  @IsOptional()
  calendar?: PlanMenuReqDto;

  @IsOptional()
  schedule?: ScheduleReqDto;

  @IsOptional()
  task?: TaskReqDto;

  @IsOptional()
  dayoff?: DayoffReqDto;

  @IsOptional()
  repeatRule?: RepeatRuleResDto;
}
export class PlanReqDto extends PartialType(PlanDto) {}
