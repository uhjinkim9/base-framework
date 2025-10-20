import { IsOptional, IsString, IsInt } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

export class TaskDto {
  @IsInt()
  taskIdx: number;

  @IsInt()
  planIdx: number;

  @IsOptional()
  @IsString()
  memo?: string;

  @Transform(({ value }) => (value ? 1 : 0))
  @IsInt()
  isAllday: number;
}
export class TaskReqDto extends PartialType(TaskDto) {}
