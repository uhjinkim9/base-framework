import { Expose, Transform } from 'class-transformer';
import { boolTransformer, dateTransformer } from 'src/common/util/transformer';

export class DocsMenuResDto {
  @Expose()
  menuIdx?: number;

  @Expose()
  menuId: string;

  @Expose()
  menuNm: string;

  @Expose()
  nodeLevel: number;

  @Expose()
  upperNode?: string;

  @Expose()
  memo?: string;

  @Transform(({ value }) => boolTransformer.from(value))
  @Expose()
  isUsed?: boolean;

  @Transform(({ value }) => boolTransformer.from(value))
  @Expose()
  isCustomed?: boolean;

  @Expose()
  joinUserId?: string;

  @Expose()
  joinDeptCd?: string;

  @Expose()
  seqNum?: number;

  @Expose()
  creatorId?: string;

  @Expose()
  updaterId?: string;

  @Expose()
  @Transform(({ value }) => dateTransformer.from(value))
  createdAt?: Date;

  @Transform(({ value }) => dateTransformer.from(value))
  @Expose()
  updatedAt?: Date;

  @Transform(({ value }) => dateTransformer.from(value))
  @Expose()
  deletedAt?: Date;
}
