import {IsString, IsNotEmpty, MaxLength, IsOptional} from "class-validator";
import {PartialType} from "@nestjs/mapped-types";
import {CommonDto} from "src/common/dto/common.dto";

export class TokenDto extends CommonDto {
  /** 사용자 ID */
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  userId: string;

  /** 기기 식별자 */
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  deviceId: string;

  /** 액세스 토큰: DB에는 없고 필요할 때만 DTO 사용 */
  @IsString()
  @IsOptional()
  @MaxLength(500)
  accessToken: string;

  /** 리프레시 토큰 */
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  refreshToken: string;

  /** 로그인 IP */
  @IsString()
  @IsOptional()
  @MaxLength(50)
  loginIp?: string;

  /** 사용자 에이전트 */
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  userAgent?: string;
}
export class TokenReqDto extends PartialType(TokenDto) {}
