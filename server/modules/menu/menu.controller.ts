import {Controller, Post, Body} from "@nestjs/common";

import {SettingCodeReqDto, SettingCodeDto} from "./dto/SettingCode.dto";
import {
  BulkDeleteMenuReqDto,
  MenuTreeReqDto,
} from "./dto/req-dto/menu-tree.req-dto";
import {MenuTreeResDto} from "./dto/res-dto/menu-tree.res.dto";
import {Result} from "src/common/util/result";

import {MenuService} from "./service/menu.service";
import {SettingCodeService} from "./service/setting-code.service";

@Controller("menu")
export class MenusController {
  constructor(
    private readonly menuSvc: MenuService,
    private readonly scSvc: SettingCodeService,
  ) {}

  @Post("/insertMenu")
  async insertMenu(
    @Body() dto: MenuTreeReqDto,
  ): Promise<Result<MenuTreeResDto>> {
    return await this.menuSvc.insertMenu(dto);
  }

  @Post("/updateMenu")
  async updateMenu(
    @Body() dto: MenuTreeReqDto,
  ): Promise<Result<MenuTreeResDto>> {
    return await this.menuSvc.updateMenu(dto);
  }

  @Post("/deleteBulkMenu")
  async deleteBulkMenu(
    @Body() dto: BulkDeleteMenuReqDto,
  ): Promise<Result<any>> {
    return await this.menuSvc.deleteBulkMenu(dto);
  }

  @Post("/getMenus")
  async getMenus(
    @Body() dto: MenuTreeReqDto,
  ): Promise<Result<MenuTreeResDto[]>> {
    return await this.menuSvc.getMenus(dto);
  }

  @Post("/getMenu")
  async getMenu(@Body() dto: MenuTreeReqDto): Promise<Result<MenuTreeResDto>> {
    return await this.menuSvc.getMenu(dto);
  }

  // ---------------------------------------------------------------

  @Post("/getSettingCode")
  async getSettingCode(
    @Body() dto: SettingCodeReqDto,
  ): Promise<SettingCodeDto[] | null> {
    const {codeClass} = dto;
    const result = await this.scSvc.getSettingCode(codeClass);

    if (!result || result.length === 0) {
      return null; // 자동으로 200 + null 응답
    }
    return result;
  }
}
