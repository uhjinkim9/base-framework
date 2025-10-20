import {
  IsString,
  IsOptional,
  IsInt,
  IsNotEmpty,
  IsDate,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import {
  boolTransformer,
  numberTransformer,
} from 'src/common/util/transformer';

export class DocsMenuDto {
  @IsInt()
  @IsOptional()
  menuIdx?: number;

  @IsString()
  @IsNotEmpty()
  menuId: string;

  @IsString()
  @IsNotEmpty()
  menuNm: string;

  @Transform(({ value }) => numberTransformer.to(value))
  @IsInt()
  nodeLevel: number;

  @IsOptional()
  @IsString()
  upperNode?: string;

  @IsString()
  @IsOptional()
  memo?: string;

  @Transform(({ value }) => boolTransformer.to(value))
  @IsNumber()
  @IsOptional()
  isUsed?: number;

  @Transform(({ value }) => boolTransformer.to(value))
  @IsNumber()
  @IsOptional()
  isCustomed?: number;

  @IsOptional()
  @IsString()
  joinEmpNo?: string;

  @IsOptional()
  @IsString()
  joinDeptCd?: string;

  @IsOptional()
  @IsInt()
  seqNum?: number;

  @IsString()
  @IsOptional()
  creatorId?: string;

  @IsString()
  @IsOptional()
  updaterId?: string;

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

export class DocsMenuReqDto extends PartialType(DocsMenuDto) {}
