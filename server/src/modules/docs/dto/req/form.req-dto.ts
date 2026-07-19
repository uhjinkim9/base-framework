import {
  IsString,
  IsOptional,
  IsInt,
  IsNotEmpty,
  IsDate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CommonDto } from 'src/common/dto/common.dto';

import {
  boolTransformer,
  dateTransformer,
  numberTransformer,
} from 'src/common/util/transformer';

export class FormDto extends CommonDto {
  @IsInt()
  @IsOptional()
  idx?: number;

  @IsString()
  @IsNotEmpty()
  formKind: string;

  @IsString()
  @IsNotEmpty()
  formId: string;

  @IsString()
  @IsNotEmpty()
  formNm: string;

  @IsString()
  @IsOptional()
  explanation: string;

  @IsString()
  @IsOptional()
  templateHtml: string;

  @IsOptional()
  @IsString()
  managerId: string;

  @IsString()
  @IsOptional()
  stampId: string;

  @Transform(({ value }) => boolTransformer.to(value))
  @IsOptional()
  @IsInt()
  approvalRequired: number;

  @Transform(({ value }) => boolTransformer.to(value))
  @IsOptional()
  @IsInt()
  isUsed: number;

  @Transform(({ value }) => numberTransformer.to(value))
  @IsOptional()
  @IsInt()
  seqNum?: number;

  @IsString()
  @IsOptional()
  creatorId: string;

  @IsString()
  @IsOptional()
  updaterId: string;

  @Transform(({ value }) => dateTransformer.to(value))
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @Transform(({ value }) => dateTransformer.to(value))
  @IsOptional()
  @IsDate()
  updatedAt: Date;

  @Transform(({ value }) => dateTransformer.to(value))
  @IsOptional()
  @IsDate()
  deletedAt: Date;
}

export class FormReqDto extends PartialType(FormDto) {}
