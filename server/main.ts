import {NestFactory} from "@nestjs/core";
import {ValidationPipe} from "@nestjs/common";
import {AppModule} from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Interceptors
  // app.useGlobalInterceptors(
  //   new PayloadToBodyInterceptor(),
  //   new RequestInfoInterceptor(),
  // );

  // 포트 설정 (단일 포트)
  const port = process.env.PORT || 8000;
  await app.listen(port);

  console.log(`${port}에서 서버가 실행 중입니다... `);
}

bootstrap();
