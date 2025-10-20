import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsIn,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

/**
 * @fileoverview SettingCode DTO
 * @description 게시판 설정 코드 분류 정보를 주고받기 위한 DTO
 *
 * @author 김어진
 * @created 2025-03-31
 * @version 1.0.0
 */
export class SettingCodeDto {
  /** 코드 분류 */
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codeClass: string;

  /** 설명 */
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  memo?: string;

  /** 사용 여부 */
  @IsIn([0, 1])
  isUsed: number;
}

export class SettingCodeReqDto extends PartialType(SettingCodeDto) {}
