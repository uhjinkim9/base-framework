import { Expose, Transform } from 'class-transformer';

import { boolTransformer, dateTransformer } from 'src/common/util/transformer';
import { DocStatusEnum } from '../../etc/doc.type';

export class DocResDto {
  @Expose()
  idx: number;

  @Expose()
  formId: string;

  @Expose()
  docId: string;

  @Expose()
  docNm: string;

  @Expose()
  docHtml: string;

  @Expose()
  status: DocStatusEnum;

  @Transform(({ value }) => boolTransformer.from(value))
  @Expose()
  isUrgent: boolean;

  @Transform(({ value }) => boolTransformer.from(value))
  @Expose()
  isTempSaved: boolean;

  @Transform(({ value }) => boolTransformer.from(value))
  @Expose()
  isScheduled: boolean;

  @Expose()
  reviewerId: string;

  @Expose()
  reviewComment: string;

  @Expose()
  @Transform(({ value }) => dateTransformer.from(value))
  reviewedAt: string;

  @Expose()
  @Transform(({ value }) => dateTransformer.from(value))
  scheduledAt: string;

  @Expose()
  creatorId: string;

  @Expose()
  updaterId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date;
}
