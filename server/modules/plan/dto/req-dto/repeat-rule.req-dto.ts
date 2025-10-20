import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { RepeatEndTypes, RepeatTypes } from '../../etc/plan.enum';

export class RepeatRuleDto {
  @IsInt()
  idx: number;

  @IsInt()
  planIdx: number;

  @IsOptional()
  @IsEnum(RepeatTypes)
  freq?: RepeatTypes;

  @IsOptional()
  @IsInt()
  interval?: number;

  @IsOptional()
  @IsString()
  byweekday?: string; // ex: 'MO,TU,FR'

  @IsOptional()
  @IsString()
  bymonthday?: string; // ex: '1,15,-1'

  @IsOptional()
  @IsString()
  bymonth?: string; // ex: '1,6,12'

  @IsOptional()
  @IsString()
  byyearday?: string; // ex: '100,200'

  @IsOptional()
  @IsInt()
  bysetpos?: number;

  @IsOptional()
  @IsString()
  dtstart?: string; // ex: '2025-06-01'

  @IsOptional()
  @IsString()
  until?: string; // ex: '2025-12-31'

  @IsOptional()
  @IsInt()
  count?: number;

  @IsOptional()
  @IsEnum(RepeatEndTypes)
  repeatEndType?: RepeatEndTypes;
}

export class RepeatRuleReqDto extends PartialType(RepeatRuleDto) {}
