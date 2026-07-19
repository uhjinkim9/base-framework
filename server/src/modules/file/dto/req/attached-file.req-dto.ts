import { IsString, IsOptional, IsInt } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CommonDto } from 'src/common/dto/common.dto';

export class AttachedFileDto extends CommonDto {
  @IsInt()
  fileIdx: number;

  @IsString()
  @IsOptional()
  fileType: string;

  @IsString()
  @IsOptional()
  fileName: string;

  @IsString()
  @IsOptional()
  fileSize: string;

  @IsString()
  @IsOptional()
  filePath: string;

  @IsString()
  @IsOptional()
  moduleNm: string;
}

export class AttachedFileReqDto extends PartialType(AttachedFileDto) {}
