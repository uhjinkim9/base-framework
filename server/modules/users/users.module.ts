import {TypeOrmModule} from "@nestjs/typeorm";
import {Module, forwardRef} from "@nestjs/common";

import {HttpModule} from "@nestjs/axios";
import {JwtModule} from "../jwt/jwt.module";
import {RabbitmqModule} from "../messaging/rabbitmq.module";

import {UserAutographEntity} from "./entity/user-autograph.entity";
import {RoleMenuMapEntity} from "./entity/role-menu-map.entity";
import {UserEntity} from "./entity/user.entity";
import {RoleEntity} from "./entity/role.entity";

import {UsersController} from "./users.controller";
import {UserService} from "./service/user.service";
import {RoleService} from "./service/role.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      RoleMenuMapEntity,
      UserAutographEntity,
    ]),
    forwardRef(() => JwtModule),
    HttpModule,
    RabbitmqModule,
  ],
  controllers: [UsersController],
  providers: [UserService, RoleService],
  exports: [UserService],
})
export class UsersModule {}
