import { Expose } from 'class-transformer';

export class TokenResDto {
  @Expose()
  userId: string;

  @Expose()
  deviceId: string;

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  loginIp?: string;

  @Expose()
  userAgent?: string;
}
