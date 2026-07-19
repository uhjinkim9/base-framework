import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {HttpModule} from "@nestjs/axios";

import {DocsController} from "./docs.controller";
import {DocsService} from "./services/docs.service";
import {DocsMenuService} from "./services/docs-menu.service";
import {FormService} from "./services/form.service";
import {DocsDashBoardService} from "./services/dash-board.service";

import {DocsMenuEntity} from "./entities/docs-menu.entity";
import {DocEntity} from "./entities/doc.entity";
import {DocRespEntity} from "./entities/doc-resp.entity";
import {MetaFieldEntity} from "./entities/meta-field.entity";
import {FormEntity} from "./entities/form.entity";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      DocsMenuEntity,
      FormEntity,
      MetaFieldEntity,
      DocEntity,
      DocRespEntity,
    ]),
  ],
  controllers: [DocsController],
  providers: [DocsService, DocsMenuService, FormService, DocsDashBoardService],
  exports: [TypeOrmModule, DocsService],
})
export class DocsModule {}
