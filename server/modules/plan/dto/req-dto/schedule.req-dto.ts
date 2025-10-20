import { IsOptional, IsString, IsInt } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

export class ScheduleDto {
  @IsInt()
  @IsOptional()
  scheduleIdx: number;

  @IsInt()
  @IsOptional()
  planIdx: number;

  @IsString()
  @IsOptional()
  memo?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsOptional()
  @IsString()
  joinEmpNo?: string;

  @IsOptional()
  @IsString()
  joinDeptCd?: string;

  @IsOptional()
  @IsString()
  joinThirdParty?: string;

  @IsInt()
  @Transform(({ value }) => (value ? 1 : 0))
  isRepeated: number;
}
export class ScheduleReqDto extends PartialType(ScheduleDto) {}
