import {Module} from "@nestjs/common";
import {JwtModule} from "./jwt/jwt.module";
import {UsersModule} from "./users/users.module";

@Module({
  imports: [UsersModule, JwtModule],
  exports: [UsersModule, JwtModule],
})
export class AuthModule {}
