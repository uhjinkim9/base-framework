import {Controller, Post, Body, Req, UseInterceptors} from "@nestjs/common";
import {Request} from "express";
import {Result} from "src/common/util/result";

import {UserReqDto} from "./dto/req/user.req-dto";
import {UserResDto} from "./dto/res/user.res-dto";
import {RoleResDto} from "./dto/res/role.res-dto";
import {RoleService} from "./service/role.service";
import {RoleReqDto} from "./dto/req/role.req-dto";
import {RoleMenuMapResDto} from "./dto/res/role-menu-map.res-dto";
import {RoleMenuMapReqDto} from "./dto/req/role-menu-map.req-dto";

import {UserService} from "./service/user.service";
import {Tokens} from "../jwt/types/tokens.type";
import {LoginInfoReqDto} from "./dto/req/login-info.req-dto";
import {RequestInfoInterceptor} from "src/common/interceptor/request-info.interceptor";

@Controller("auth")
export class UsersController {
  constructor(
    private readonly userSvc: UserService,
    private readonly roleSvc: RoleService,
  ) {}

  /*************************** user ***************************/
  @UseInterceptors(RequestInfoInterceptor)
  @Post("/doLogin")
  async Login(@Body() dto: LoginInfoReqDto): Promise<Result<Tokens>> {
    return await this.userSvc.doLogin(dto);
  }

  @Post("getUsers")
  async getUsers(@Body() dto: UserReqDto): Promise<Result<UserResDto[]>> {
    return await this.userSvc.getUsers(dto);
  }

  @Post("/updateUserRole")
  async updateUserRole(
    @Body() dto: {roleId: string; userIds: string[]},
  ): Promise<Result<UserResDto[]>> {
    return this.userSvc.updateUsersRole(dto);
  }

  @Post("/createOrUpdateUser")
  async createOrUpdateUser(
    @Body() dto: UserReqDto,
  ): Promise<Result<UserResDto>> {
    return await this.userSvc.createOrUpdateUser(dto);
  }

  /*************************** role ***************************/
  @Post("/getUserRoleMenus")
  async getUserRoleMenus(@Body() dto: UserReqDto): Promise<Result<any[]>> {
    return await this.roleSvc.getUserRoleMenus(dto);
  }

  @Post("/getRoleMenuIds")
  async getRoleMenuIds(@Body() dto: RoleReqDto): Promise<Result<string[]>> {
    return await this.roleSvc.getRoleMenuIds(dto);
  }

  @Post("/getUserRoles")
  async getUserRoles(@Body() dto: RoleReqDto): Promise<Result<RoleResDto[]>> {
    return await this.roleSvc.getUserRoles(dto);
  }

  @Post("/getRole")
  async getRole(@Body() dto: RoleReqDto): Promise<Result<RoleResDto>> {
    return await this.roleSvc.getRole(dto);
  }

  @Post("/deleteRole")
  async deleteRole(@Body("idList") idList: string[]): Promise<Result<any>> {
    return await this.roleSvc.deleteRole(idList);
  }

  @Post("/getRoleMenu")
  async getRoleMenu(
    @Body() dto: RoleMenuMapReqDto,
  ): Promise<Result<RoleMenuMapResDto>> {
    return await this.roleSvc.getRoleMenu(dto);
  }

  @Post("/getRoleMenus")
  async getRoleMenus(@Body() dto: RoleReqDto): Promise<Result<any[]>> {
    return await this.roleSvc.getRoleMenus(dto);
  }

  @Post("/createOrUpdateRole")
  async createOrUpdateRole(
    @Body() dto: RoleReqDto,
  ): Promise<Result<RoleResDto>> {
    return await this.roleSvc.createOrUpdateRole(dto);
  }

  @Post("/createRoleMenu")
  async createRoleMenu(
    @Body() dto: RoleMenuMapReqDto,
  ): Promise<Result<RoleMenuMapResDto>> {
    return await this.roleSvc.createRoleMenu(dto);
  }

  @Post("/updateRoleMenu")
  async updateRoleMenu(
    @Body() dto: RoleMenuMapReqDto,
  ): Promise<Result<RoleMenuMapResDto>> {
    return await this.roleSvc.updateRoleMenu(dto);
  }

  @Post("/deleteRoleMenu")
  async deleteRoleMenu(
    @Body("idList") idList: string[],
  ): Promise<Result<RoleMenuMapResDto>> {
    return await this.roleSvc.deleteRoleMenu(idList);
  }

  // 아직 위까지만 제대로 사용

  // @Post('/create')
  // async create(@Body() dto: UserReqDto): Promise<void> {
  //   await this.usersService.create(dto);
  // }

  // @Get(':id')
  // asyncfindOne(@Param('userId') userId: string) {
  //   return this.usersService.findOne(userId);
  // }

  // @Get('/:id'), Patch는 뭐였지
  // async getUserInfo(@Param('id') userId: string): Promise<UserInfo> {
  //   return await this.usersService.getUserInfo(userId);
  // }
}
