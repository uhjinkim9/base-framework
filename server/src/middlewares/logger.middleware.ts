import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// 추후 winston 사용하여 더욱 질 좋은 로그로!

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('[LoggerMiddleware] Request...');
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log(`Headers: ${JSON.stringify(req.headers)}`);
    console.log(`Body: ${JSON.stringify(req.body)}`);

    // 요청 처리를 다음 미들웨어나 라우터 핸들러에게 넘김
    next();

    // res로 마무리하면 다음 미들웨어로 전달되지 않음
    // 응답이 보내진 후 로깅을 추가로 수행할 수 있음
    res.on('finish', () => {
      console.log(`Response status: ${res.statusCode}`);
    });
  }
}
