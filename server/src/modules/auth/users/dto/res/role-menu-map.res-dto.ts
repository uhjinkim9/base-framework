import { Expose, Transform } from 'class-transformer';
import { dateTransformer, boolTransformer } from 'src/common/util/transformer';

export class RoleMenuMapResDto {
  @Expose()
  idx: number;

  @Expose()
  roleId: string;

  @Expose()
  menuId: string;

  @Expose()
  creatorId?: string;

  @Expose()
  updaterId?: string;

  @Expose()
  @Transform(({ value }) => boolTransformer.from(value))
  roleUser: boolean;

  @Expose()
  @Transform(({ value }) => boolTransformer.from(value))
  roleAdmin: boolean;

  @Expose()
  @Transform(({ value }) => boolTransformer.from(value))
  isUsed: boolean;

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
