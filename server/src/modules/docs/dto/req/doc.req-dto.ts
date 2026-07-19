import {
  IsString,
  IsOptional,
  IsInt,
  IsNotEmpty,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CommonDto } from 'src/common/dto/common.dto';

import { boolTransformer, dateTransformer } from 'src/common/util/transformer';
import { DocStatusEnum } from '../../etc/doc.type';

export class DocDto extends CommonDto {
  @IsInt()
  @IsOptional()
  idx: number;

  @IsString()
  @IsNotEmpty()
  formId: string;

  @IsString()
  @IsOptional()
  docId: string;

  @IsString()
  @IsOptional()
  docNm: string;

  @IsString()
  @IsOptional()
  docHtml: string;

  @IsOptional()
  @IsEnum(DocStatusEnum)
  status: DocStatusEnum;

  @Transform(({ value }) => boolTransformer.to(value))
  @IsInt()
  @IsOptional()
  isUrgent: number;

  @Transform(({ value }) => boolTransformer.to(value))
  @IsInt()
  @IsOptional()
  isTempSaved: number;

  @Transform(({ value }) => boolTransformer.to(value))
  @IsInt()
  @IsOptional()
  isScheduled: number;

  @IsString()
  @IsOptional()
  reviewerId: string;

  @IsString()
  @IsOptional()
  reviewComment: string;

  @Transform(({ value }) => dateTransformer.to(value))
  @IsOptional()
  @IsDate()
  scheduledAt: Date;

  @Transform(({ value }) => dateTransformer.to(value))
  @IsOptional()
  @IsDate()
  reviewedAt: Date;

  @IsString()
  @IsOptional()
  creatorId: string;

  @IsString()
  @IsOptional()
  updaterId: string;
}

export class DocReqDto extends PartialType(DocDto) {}
