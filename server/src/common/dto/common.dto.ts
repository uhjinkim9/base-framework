import {IsOptional} from "class-validator";

/**
 * JWT 분석으로 추출된 사용자 정보 타입
 */
export class JwtPayloadDTO {
  @IsOptional()
  payload: any;
}

/**
 * 요청 정보 타입
 */
export class RequestInfoDTO {
  @IsOptional()
  method?: string;

  @IsOptional()
  url?: string;

  @IsOptional()
  loginIp?: string;

  @IsOptional()
  userAgent?: string;

  @IsOptional()
  headers?: any;
}

/**
 * 공통 DTO = payload + requestInfo
 */
export class CommonDto {
  @IsOptional()
  payload?: JwtPayloadDTO["payload"];

  @IsOptional()
  requestInfo?: RequestInfoDTO;
}

// ✅ 사용 예시
// - payload 안에서 JWT 정보 꺼내기
// console.log(dto.payload?.userId);
// console.log(dto.payload?.role);

// - requestInfo 안에서 요청 메타 정보 꺼내기
// console.log(dto.requestInfo?.url);
// console.log(dto.requestInfo?.ip);
