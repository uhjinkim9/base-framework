import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {MenuTreeEntity} from "./entity/MenuTree.entity";
import {SettingCodeValue} from "./entity/SettingCodeValue.entity";
import {SettingCodeEntity} from "./entity/SettingCode.entity";
import {SettingCodeDetailEntity} from "./entity/SettingCodeDetail.entity";

import {MenusController} from "./menu.controller";

import {MenuService} from "./service/menu.service";
import {SettingCodeService} from "./service/setting-code.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuTreeEntity,
      SettingCodeEntity,
      SettingCodeDetailEntity,
      SettingCodeValue,
    ]),
  ],
  controllers: [MenusController],
  providers: [MenuService, SettingCodeService],
})
export class MenuModule {}
