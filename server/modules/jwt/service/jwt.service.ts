/**
 * @fileoverview JWTService - JWT 토큰 관리 서비스
 * @description 이 서비스는 사용자 인증을 위한 JWT 액세스 토큰 및 리프레시 토큰을 생성하고 관리하는 역할을 한다.
 *
 * @method issueToken - 사용자 정보 기반으로 액세스 토큰과 리프레시 토큰을 발급
 * @method generateJwt - 주어진 정보와 만료 기간을 기반으로 JWT 생성
 * @method getJwtPrivateKey - 개인 키(private key) 로드
 *
 * @author 김어진
 */

import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";
import {
  Injectable,
  UnauthorizedException,
  UseInterceptors,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {SignOptions, Algorithm} from "jsonwebtoken";
import {Repository} from "typeorm";

import {TokenPayloadInfo, Tokens} from "../types/tokens.type";
import {TokenReqDto} from "../dto/req/token.req-dto";
import {TokenEntity} from "../entity/token.entity";
import {UserService} from "src/module/users/service/user.service";
import {RequestInfoInterceptor} from "src/common/interceptor/request-info.interceptor";

@Injectable()
export class JWTService {
  constructor(
    @InjectRepository(TokenEntity)
    private tokenRepo: Repository<TokenEntity>,

    private readonly userSvc: UserService,
  ) {}

  private readonly expiresInAccess: string = "1h"; // 액세스 토큰 만료 시간
  private readonly expiresInRefresh: string = "7d"; // 리프레시 토큰 만료 시간

  private getJwtPrivateKey(): string {
    const keyPath = path.join(process.cwd(), "keys", "private.pem");
    const key = fs.readFileSync(keyPath, "utf8");
    return key;
  }

  /**
   * 로그인 성공 시 JWT 발급 (액세스 토큰, 리프레시 토큰)
   * @param {TokenPayloadInfo} payload 토큰에 담길 사용자 정보
   * @param {boolean} isRenew 갱신일 경우 리프레시 토큰 재발급 생략
   * @returns {Tokens} 발급된 토큰 객체
   */
  issueToken(payload: TokenPayloadInfo, isRenew: boolean): Tokens {
    const accessToken = this.generateJwt(payload, this.expiresInAccess);

    if (isRenew) {
      return {accessToken};
    }

    const refreshToken = this.generateJwt(payload, this.expiresInRefresh);
    return {accessToken, refreshToken};
  }

  /**
   * 액세스 토큰 만료 시 검증
   */
  @UseInterceptors(RequestInfoInterceptor)
  async renewToken(dto: TokenReqDto) {
    const {userId, deviceId, requestInfo} = dto;
    const {userAgent, loginIp} = requestInfo;

    // ID로 유저 정보 있는지 검증
    const existingUser = await this.userSvc.getUser(userId);
    const user = existingUser?.data;
    const roleId = user?.roleId;
    if (!user) {
      throw new Error("해당하는 사용자 없음");
    }

    const storedRefreshToken = await this.tokenRepo.findOne({
      where: {userId: userId, deviceId: deviceId},
    });

    if (!storedRefreshToken) {
      throw new UnauthorizedException("리프레시 토큰 없음");
    }
    const privateKey = this.getJwtPrivateKey();

    // 리프레시 토큰 유효할 경우
    try {
      jwt.verify(storedRefreshToken.refreshToken, privateKey);

      // TODO: 로그인 IP 및 사용자 에이전트 검증 (선택 사항) - 다른 곳에서 로그인되었다는 알림 발송 가능
      //  if (loginIp && storedRefreshToken.loginIp && loginIp !== storedRefreshToken.loginIp) {
      //   console.warn('IP 주소가 일치하지 않습니다.');
      // }
      // if (userAgent && storedRefreshToken.userAgent && userAgent !== storedRefreshToken.userAgent) {
      //   console.warn('사용자 에이전트가 일치하지 않습니다.');
      // }

      // 액세스 토큰 재발급만 수행
      const {accessToken} = this.issueToken(
        {
          userId: userId,
          deviceId: deviceId,
          userAgent: userAgent,
          loginIp: loginIp,
          roleId: roleId,
        },
        true,
      );
      return {accessToken: accessToken};
    } catch (e) {
      // 기존 리프레시 토큰 삭제
      await this.tokenRepo.delete({
        userId: userId,
        deviceId: deviceId,
      });

      console.error("JWT verify 실패:", e);
      throw new UnauthorizedException("유효하지 않은 리프레시 토큰");
    }
  }

  /** 토큰 검증 */
  async verifyToken(dto: TokenReqDto): Promise<boolean> {
    const {userId, deviceId} = dto;
    if (!userId || !deviceId) return false;

    const token = await this.tokenRepo.findOne({
      where: {
        userId: userId,
        deviceId: deviceId,
      },
    });
    if (!token) return false;

    const privateKey = this.getJwtPrivateKey();

    try {
      jwt.verify(token.refreshToken, privateKey);
      return true;
    } catch (e) {
      console.log("기존에 로그인되어 있지 않음");
      return false;
    }
  }

  /**
   * JWT 생성 (액세스 토큰, 리프레시 토큰)
   * @param {TokenArgs} userInfo 토큰에 담길 사용자 정보
   * @param {string} expiresIn 토큰 만료 기간
   * @returns {string} 생성된 토큰
   */
  private generateJwt(userInfo: TokenPayloadInfo, expiresIn: string): string {
    const privateKey = this.getJwtPrivateKey();
    const options: SignOptions = {
      algorithm: "RS256" as Algorithm,
      expiresIn: expiresIn as any,
    };

    return jwt.sign(userInfo, privateKey, options);
  }

  async insertRefreshToken(
    userId: string,
    deviceId: string,
    refreshToken: string,
    loginIp: string,
    userAgent: string,
  ) {
    const token = new TokenEntity();
    token.userId = userId;
    token.deviceId = deviceId;
    token.refreshToken = refreshToken;
    token.loginIp = loginIp;
    token.userAgent = userAgent;

    await this.tokenRepo.upsert(token, ["userId", "deviceId"]);
  }
}
