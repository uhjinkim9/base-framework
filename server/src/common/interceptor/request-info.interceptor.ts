import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import {Observable} from "rxjs";

@Injectable()
export class RequestInfoInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const body = req.body ?? {};

    const info = {
      method: req.method,
      url: req.originalUrl || req.url,
      loginIp: req.ip,
      userAgent: req.headers["user-agent"],
      headers: req.headers,
    };

    // DTO에서 받을 수 있도록 body에 주입
    req.body = {
      ...body,
      requestInfo: info,
    };

    return next.handle();
  }
}
