import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

/**
 * @fileoverview SettingCodeValue DTO
 * @description 게시판 설정 코드 값 정보를 주고받기 위한 DTO
 *
 * @author 김어진
 * @created 2025-03-31
 * @version 1.0.0
 */
export class SettingCodeValueDto {
  /** 설정 상세 인덱스 */
  @IsInt()
  @IsNotEmpty()
  detailIdx: number;

  /** 설정 값 */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  settingValue: string;
}

export class SettingCodeValueReqDto extends PartialType(SettingCodeValueDto) {}
