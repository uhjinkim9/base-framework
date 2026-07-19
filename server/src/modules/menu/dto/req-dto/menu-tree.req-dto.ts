import {PartialType} from "@nestjs/mapped-types";
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
  IsArray,
} from "class-validator";
import {Transform} from "class-transformer";

import {CommonDto} from "src/common/dto/common.dto";
import {boolTransformer, numberTransformer} from "src/common/util/transformer";

export class MenuTreeDto extends CommonDto {
  @IsInt()
  idx: number;

  @IsString()
  @IsNotEmpty()
  menuId: string;

  @IsString()
  @IsNotEmpty()
  menuNm: string;

  @IsInt()
  @Min(1)
  nodeLevel: number;

  @IsString()
  @IsOptional()
  upperNode: string;

  @Transform(({value}) => boolTransformer.to(value))
  @IsInt()
  @IsOptional()
  isUsed: number;

  @Transform(({value}) => boolTransformer.to(value))
  @IsInt()
  @IsOptional()
  isChangeable: number;

  @Transform(({value}) => numberTransformer.to(value))
  @IsInt()
  @IsOptional()
  seqNum: number;
}

export class MenuTreeReqDto extends PartialType(MenuTreeDto) {}

export class BulkDeleteMenuReqDto extends CommonDto {
  @IsArray()
  @IsInt({each: true})
  menuIdxs: number[]; // 삭제할 메뉴 ID 배열

  @IsInt()
  @Min(1)
  nodeLevel: number;
}
