// src/common/interceptor/payload-to-body.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import {Observable} from "rxjs";

type JwtPayloadType = {
  userId?: string;
  deviceId?: string;
  refreshToken?: string;
  loginIp?: string;
  userAgent?: string;
  roleId?: string;
};

@Injectable()
export class PayloadToBodyInterceptor implements NestInterceptor {
  private extractTokenFromHeader(req: any): string | undefined {
    const auth: string | undefined = req?.headers?.authorization;
    const [type, token] = auth?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private decodeJwtPayload(token: string): any | undefined {
    try {
      const parts = token.split(".");
      if (parts.length < 2) return undefined;
      const payload = JSON.parse(
        Buffer.from(parts[1], "base64").toString("utf8"),
      );
      return payload;
    } catch {
      return undefined;
    }
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const body = req.body ?? {};

    let user: JwtPayloadType | undefined = req?.user;

    // 가드가 user를 주입하지 못했다면, 인터셉터에서 토큰 payload 디코드 시도(검증 없이, 실패시 무시)
    if (!user) {
      const token = this.extractTokenFromHeader(req);
      if (token) {
        const decoded = this.decodeJwtPayload(token) as
          | JwtPayloadType
          | undefined;
        if (decoded) {
          user = decoded;
          req.user = user;
        }
      }
    }

    if (user) {
      const payload = {
        userId: user.userId,
        deviceId: user.deviceId,
        refreshToken: user.refreshToken,
        loginIp: user.loginIp,
        userAgent: user.userAgent,
        roleId: user.roleId,
      };

      // 기존 필드(payload)를 유지하면서 user 별칭을 함께 제공
      req.body = {
        ...body,
        payload: {...(body?.payload ?? {}), ...payload},
        user: {...(body?.user ?? {}), ...payload},
      };
    }

    return next.handle();
  }
}
