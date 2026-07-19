import {IsInt, IsOptional, IsString} from "class-validator";

import {CommonDto} from "src/common/dto/common.dto";

export class PaginationReqDto extends CommonDto {
  @IsOptional()
  @IsString()
  menuId: string;

  @IsOptional()
  @IsInt()
  page: number;

  @IsOptional()
  @IsInt()
  limit: number;

  // 검색 키워드
  @IsOptional()
  @IsString()
  searchKeyword: string;

  // 검색 카테고리
  @IsOptional()
  @IsString()
  searchCategory: string;
}
