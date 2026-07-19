import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CommonDto } from 'src/common/dto/common.dto';

export class OptionDto {
  @IsOptional()
  @IsString()
  menuId: string;

  @IsOptional()
  @IsString()
  upperNodeId?: string;

  @IsOptional()
  @IsInt()
  page: number;

  @IsOptional()
  @IsInt()
  limit: number;

  // 검색 아직 미구현
  @IsOptional()
  @IsString()
  searchKeyword: string;
}

export class PaginationDto extends CommonDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => OptionDto)
  option?: OptionDto;
}

export class PaginationReqDto extends PartialType(PaginationDto) {}
