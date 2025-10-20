import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {ScheduleModule} from "@nestjs/schedule";

import {LoggerMiddleware} from "middlewares/logger.middleware";
import {DatabaseModule} from "config/orm.config";

import {AdminModule} from "modules/admin/admin.module";
import {DocsModule} from "modules/docs/docs.module";
import {FileModule} from "modules/file/file.module";
import {JwtModule} from "modules/jwt/jwt.module";
import {MenuModule} from "modules/menu/menu.module";
import {PlansModule} from "modules/plan/plans.module";
import {TaskModule} from "modules/task/task.module";
import {UsersModule} from "modules/users/users.module";

@Module({
  imports: [
    // 환경 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),

    ScheduleModule.forRoot(),
    DatabaseModule,

    // 도메인 모듈들
    AdminModule,
    DocsModule,
    FileModule,
    JwtModule,
    MenuModule,
    PlansModule,
    TaskModule,
    UsersModule,
  ],
})
export class AppModule {
  configure(consumer: any) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
