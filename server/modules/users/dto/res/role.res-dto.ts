import { Expose, Transform } from 'class-transformer';
import { dateTransformer, boolTransformer } from 'src/common/util/transformer';

export class RoleResDto {
  @Expose()
  roleId: string;

  @Expose()
  roleNm: string;

  @Expose()
  memo?: string;

  @Expose()
  creatorId?: string;

  @Expose()
  updaterId?: string;

  @Expose()
  @Transform(({ value }) => boolTransformer.from(value))
  isUsed?: boolean;

  @Expose()
  @Transform(({ value }) => dateTransformer.from(value))
  createdAt?: Date;

  @Expose()
  @Transform(({ value }) => dateTransformer.from(value))
  updatedAt?: Date;

  @Expose()
  @Transform(({ value }) => dateTransformer.from(value))
  deletedAt?: Date;
}
