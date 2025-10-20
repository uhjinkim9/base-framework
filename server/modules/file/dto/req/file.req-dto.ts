import { IsString, IsOptional, IsArray } from 'class-validator';

export class UploadFilesReqDto {
  @IsString()
  @IsOptional()
  moduleNm?: string;
}

export class GetFilesReqDto {
  @IsArray()
  @IsOptional()
  fileIdxes: number[];

  @IsString()
  @IsOptional()
  moduleNm?: string;
}
