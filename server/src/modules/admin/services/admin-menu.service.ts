import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { Result } from 'src/common/util/result';

import { AdminMenuEntity } from '../entities/admin-menu.entity';

import { AdminMenuReqDto } from '../dto/req/admin-menu.req-dto';
import { AdminMenuResDto } from '../dto/res/admin-menu.res-dto';

@Injectable()
export class AdminMenuService {
  constructor(
    @InjectRepository(AdminMenuEntity)
    private amRepo: Repository<AdminMenuEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async getAdminMenus(
    dto: AdminMenuReqDto,
  ): Promise<Result<AdminMenuResDto[]>> {
    const { upperNode } = dto;
    const menus = await this.amRepo.find({
      where: { isUsed: 1, upperNode: upperNode },
      relations: ['children', 'children.children'],
      order: { seqNum: 'ASC' },
    });
    const res = plainToInstance(AdminMenuResDto, menus);
    return Result.success(res, `관리자 사이드바 메뉴(${upperNode}) 로딩 완료`);
  }
}
