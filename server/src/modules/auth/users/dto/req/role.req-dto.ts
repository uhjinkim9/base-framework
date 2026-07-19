import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsDate } from 'class-validator';
import { boolTransformer } from 'src/common/util/transformer';

export class RoleDto {
  @IsString()
  @IsOptional()
  roleId: string;

  /** 역할명 */
  @IsString()
  @IsOptional()
  roleNm: string;

  /** 설명 */
  @IsString()
  @IsOptional()
  memo?: string;

  /** 생성자 ID */
  @IsString()
  @IsOptional()
  creatorId?: string;

  /** 변경자 ID */
  @IsString()
  @IsOptional()
  updaterId?: string;

  /** 사용 여부 */
  @Transform(({ value }) => boolTransformer.to(value))
  @IsOptional()
  @IsInt()
  isUsed?: number;
}

export class RoleReqDto extends RoleDto {}
