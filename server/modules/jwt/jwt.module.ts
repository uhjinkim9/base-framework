import {Module, forwardRef} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {JWTController} from "./jwt.controller";
import {JWTService} from "./service/jwt.service";

import {TokenEntity} from "./entity/token.entity";
import {UsersModule} from "../users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenEntity]),
    forwardRef(() => UsersModule),
  ],
  providers: [JWTService],
  controllers: [JWTController],
  exports: [JWTService],
})
export class JwtModule {}
