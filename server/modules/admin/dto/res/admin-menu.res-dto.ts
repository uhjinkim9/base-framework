import { ValidateNested } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';

export class AdminMenuResDto {
  @Expose()
  menuIdx: number;

  @Expose()
  menuId: string;

  @Expose()
  menuNm: string;

  @Expose()
  nodeLevel: number;

  @Expose()
  upperNode: string;

  @Expose()
  memo?: string;

  @Transform(({ value }) => value === 1)
  @Expose()
  isUsed: boolean;

  @Expose()
  seqNum: number;

  @Expose()
  creatorId?: string;

  @Expose()
  updaterId?: string;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  createdAt?: Date;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  updatedAt?: Date;

  @Expose()
  @Type(() => AdminMenuResDto)
  parent?: AdminMenuResDto;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => AdminMenuResDto)
  children?: AdminMenuResDto[];
}
