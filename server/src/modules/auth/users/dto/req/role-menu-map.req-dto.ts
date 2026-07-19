import { IsString, IsOptional, IsInt, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class RoleMenuMapDto {
  @IsOptional()
  @IsInt()
  idx: number;

  @IsOptional()
  /** 역할 ID */
  @IsString()
  roleId: string;

  /** 메뉴 ID */
  @IsOptional()
  @IsString()
  menuId: string;

  /** 생성자 ID */
  @IsOptional()
  @IsString()
  creatorId?: string;

  /** 변경자 ID */
  @IsOptional()
  @IsString()
  updaterId?: string;

  @Transform(({ value }) => (value ? 1 : 0))
  @IsInt()
  @IsOptional()
  roleUser: number;

  @Transform(({ value }) => (value ? 1 : 0))
  @IsInt()
  @IsOptional()
  roleAdmin: number;

  /** 사용 여부 */
  @Transform(({ value }) => (value ? 1 : 0))
  @IsInt()
  @IsOptional()
  isUsed: number;

  /** 생성일 */
  @Transform(({ value }) =>
    typeof value === 'string' ? new Date(value) : undefined,
  )
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  /** 변경일 */
  @Transform(({ value }) =>
    typeof value === 'string' ? new Date(value) : undefined,
  )
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  /** 변경일 */
  @Transform(({ value }) =>
    typeof value === 'string' ? new Date(value) : undefined,
  )
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}

export class RoleMenuMapReqDto extends PartialType(RoleMenuMapDto) {}
