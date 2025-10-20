import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SettingCodeEntity } from '../entity/SettingCode.entity';

@Injectable()
export class SettingCodeService {
  constructor(
    @InjectRepository(SettingCodeEntity)
    private codeRepo: Repository<SettingCodeEntity>,
  ) {}

  async getSettingCode(codeClass: string) {
    const settingCode = await this.codeRepo.find({
      where: { codeClass: codeClass, isUsed: 1 },
      relations: ['detail'],
    });

    if (!settingCode) {
      throw new NotFoundException(`설정 정보가 존재하지 않습니다`);
    }
    return settingCode;
  }
}
