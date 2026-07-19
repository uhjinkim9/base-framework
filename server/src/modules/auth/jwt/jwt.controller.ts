import {Controller, Post, Body, UseInterceptors} from "@nestjs/common";

import {TokenReqDto} from "./dto/req/token.req-dto";
import {Tokens} from "./types/tokens.type";

import {JWTService} from "./service/jwt.service";
import {RequestInfoInterceptor} from "src/common/interceptor/request-info.interceptor";

@Controller("auth")
export class JWTController {
  constructor(private readonly jwtService: JWTService) {}

  @UseInterceptors(RequestInfoInterceptor)
  @Post("/renewToken")
  async renewToken(@Body() dto: TokenReqDto): Promise<Tokens> {
    return await this.jwtService.renewToken(dto);
  }

  @Post("/verifyToken")
  async verifyToken(@Body() dto: TokenReqDto): Promise<boolean> {
    return await this.jwtService.verifyToken(dto);
  }
}
