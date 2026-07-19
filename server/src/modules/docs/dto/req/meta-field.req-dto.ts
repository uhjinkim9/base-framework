import {
  IsString,
  IsOptional,
  IsInt,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

import { boolTransformer } from 'src/common/util/transformer';
import { FormReqDto } from './form.req-dto';

export class MetaFieldDto {
  @IsString()
  @IsNotEmpty()
  formId: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  tagName: string;

  @IsString()
  @IsOptional()
  type: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  value: string;

  @IsString()
  @IsOptional()
  options: string;

  @IsString()
  @IsOptional()
  width: string;

  @IsString()
  @IsOptional()
  placeholder: string;

  @Transform(({ value }) => boolTransformer.to(value))
  @IsBoolean()
  isRequired: boolean;

  form?: FormReqDto;
}

export class MetaFieldReqDto extends PartialType(MetaFieldDto) {}
