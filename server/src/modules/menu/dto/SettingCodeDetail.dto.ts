import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

/**
 * @fileoverview SettingCodeDetail DTO
 * @description 게시판 설정 코드 상세 정보를 주고받기 위한 DTO
 *
 * @author 김어진
 * @created 2025-03-31
 * @version 1.0.0
 */
export class SettingCodeDetailDto {
  /** 설정 코드 분류 */
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codeClass: string;

  /** 설정 이름 */
  @IsString()
  @IsOptional()
  @MaxLength(100)
  codeNm?: string;

  /** 입력 유형 */
  @IsString()
  @IsOptional()
  @MaxLength(20)
  settingInput?: string;
}

export class SettingCodeDetailReqDto extends PartialType(
  SettingCodeDetailDto,
) {}
