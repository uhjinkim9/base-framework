import { IsOptional, IsString, IsEnum, IsInt, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { HalfOffTypes, OffTypes } from '../../etc/plan.enum';

export class DayoffDto {
  @IsInt()
  dayoffIdx: number;

  @IsInt()
  planIdx: number;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsOptional()
  @IsEnum(OffTypes)
  offType: OffTypes;

  @IsOptional()
  @IsEnum(HalfOffTypes)
  halfOff?: HalfOffTypes;

  @IsNumber()
  offDays: number;
}
export class DayoffReqDto extends PartialType(DayoffDto) {}
