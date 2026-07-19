import {
  IsString,
  IsOptional,
  IsInt,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class AdminMenuDto {
  @IsInt()
  @IsOptional()
  menuIdx: number;

  @IsString()
  menuId: string;

  @IsString()
  menuNm: string;

  @IsInt()
  nodeLevel: number;

  @IsString()
  upperNode: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsInt()
  @Transform(({ value }) => (value ? 1 : 0))
  isUsed: number;

  @IsInt()
  seqNum: number;

  @IsOptional()
  @IsString()
  creatorId?: string;

  @IsOptional()
  @IsString()
  updaterId?: string;

  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdminMenuDto)
  parent?: AdminMenuDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AdminMenuDto)
  children?: AdminMenuDto[];
}

export class AdminMenuReqDto extends PartialType(AdminMenuDto) {}
