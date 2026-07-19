import { Expose, Transform } from 'class-transformer';
import { boolTransformer, dateTransformer } from 'src/common/util/transformer';

export class FormResDto {
  @Expose()
  idx?: number;

  @Expose()
  formKind: string;

  @Expose()
  formId: string;

  @Expose()
  formNm: string;

  @Expose()
  explanation: string;

  @Expose()
  templateHtml: string;

  @Expose()
  managerId: string;

  @Expose()
  stampId: string;

  @Transform(({ value }) => boolTransformer.from(value))
  @Expose()
  approvalRequired: boolean;

  @Transform(({ value }) => boolTransformer.from(value))
  @Expose()
  isUsed: boolean;

  @Expose()
  seqNum: number;

  @Expose()
  creatorId: string;

  @Expose()
  updaterId: string;

  @Transform(({ value }) => dateTransformer.from(value))
  @Expose()
  createdAt: Date;

  @Transform(({ value }) => dateTransformer.from(value))
  @Expose()
  updatedAt: Date;

  @Transform(({ value }) => dateTransformer.from(value))
  @Expose()
  deletedAt: Date;
}
