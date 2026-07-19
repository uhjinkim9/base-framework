import {Expose, Transform} from "class-transformer";
import {dateTransformer, boolTransformer} from "src/common/util/transformer";
import {RoleResDto} from "./role.res-dto";

export class UserResDto {
  @Expose()
  userId: string;

  @Expose()
  companyId: string;

  @Expose()
  userNm: string;

  @Expose()
  userPw: string;

  @Expose()
  @Transform(({value}) => boolTransformer.from(value))
  isUsed: boolean;

  @Expose()
  @Transform(({value}) => boolTransformer.from(value))
  isRestricted: boolean;

  @Expose()
  roleId: string;

  @Expose()
  loginFailCount?: number | null;

  @Expose()
  email?: string | null;

  @Expose()
  extEmail?: string | null;

  @Expose()
  @Transform(({value}) => boolTransformer.from(value))
  isEmailSubscribed: boolean;

  @Expose()
  @Transform(({value}) => dateTransformer.from(value))
  createdAt?: Date;

  @Expose()
  @Transform(({value}) => dateTransformer.from(value))
  updatedAt?: Date;

  @Expose()
  @Transform(({value}) => dateTransformer.from(value))
  deletedAt?: Date;

  @Expose()
  role?: RoleResDto;
}
