import { Controller, Post, Body } from '@nestjs/common';

import { Result } from 'src/common/util/result';

import { AdminMenuService } from '../services/admin-menu.service';

import { AdminMenuReqDto } from '../dto/req/admin-menu.req-dto';
import { AdminMenuResDto } from '../dto/res/admin-menu.res-dto';

@Controller('auth')
export class AdminController {
  constructor(private readonly amSvc: AdminMenuService) {}

  @Post('/getAdminMenus')
  async getAdminMenus(
    @Body() dto: AdminMenuReqDto,
  ): Promise<Result<AdminMenuResDto[]>> {
    return await this.amSvc.getAdminMenus(dto);
  }
}
