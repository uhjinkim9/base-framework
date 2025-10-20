import {IsString, IsNotEmpty} from "class-validator";
import {CommonDto} from "src/common/dto/common.dto";

export class LoginInfoReqDto extends CommonDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userPw: string;

  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
