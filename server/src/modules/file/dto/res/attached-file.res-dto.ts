import { Expose } from 'class-transformer';

export class AttachedFileResDto {
  @Expose()
  fileIdx: number;

  @Expose()
  fileType: string;

  @Expose()
  fileName: string;

  @Expose()
  fileSize: string;

  @Expose()
  filePath: string;

  @Expose()
  moduleNm: string;

  @Expose()
  createdAt: Date;
}
