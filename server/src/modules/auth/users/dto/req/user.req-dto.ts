import {
  IsString,
  IsOptional,
  IsInt,
  IsEmail,
  IsDate,
  MaxLength,
} from "class-validator";
import {Transform} from "class-transformer";
import {PartialType} from "@nestjs/mapped-types";

import {dateTransformer, boolTransformer} from "src/common/util/transformer";

export class UserDto {
  @IsString()
  userId: string;

  @IsString()
  companyId: string;

  @IsString()
  userNm: string;

  @IsString()
  userPw: string;

  @Transform(({value}) => boolTransformer.to(value))
  @IsInt()
  isUsed: number;

  @Transform(({value}) => boolTransformer.to(value))
  @IsInt()
  isRestricted: number;

  @IsString()
  @MaxLength(50)
  roleId: string;

  @IsOptional()
  @IsInt()
  loginFailCount: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEmail()
  extEmail?: string;

  @Transform(({value}) => boolTransformer.to(value))
  @IsInt()
  isEmailSubscribed: number;

  @Transform(({value}) => dateTransformer.to(value))
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @Transform(({value}) => dateTransformer.to(value))
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @Transform(({value}) => dateTransformer.to(value))
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}

export class UserReqDto extends PartialType(UserDto) {}
