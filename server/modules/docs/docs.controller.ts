import { FormService } from './services/form.service';
import { Body, Controller, Post } from '@nestjs/common';

import { Result } from 'src/common/util/result';
import {
  FormWithFieldsReqType,
  FormWithFieldsResType,
  FormWithFieldsAndUserResType,
} from './etc/doc.type';

import { DocsService } from './services/docs.service';
import { DocsMenuService } from './services/docs-menu.service';
import { DocsDashBoardService } from './services/dash-board.service';

import { DocsMenuReqDto } from './dto/req/docs-menu.req-dto';
import { DocsMenuResDto } from './dto/res/docs-menu.res-dto';
import { FormReqDto } from './dto/req/form.req-dto';
import { FormResDto } from './dto/res/form.res-dto';
import { DocReqDto } from './dto/req/doc.req-dto';
import { DocResDto } from './dto/res/doc.res-dto';
import { PaginationReqDto } from './dto/req/pagination.req-dto';
import { PaginationResDto } from './dto/res/pagination.res-dto';

@Controller('docs')
export class DocsController {
  constructor(
    private readonly docSvc: DocsService,
    private readonly formSvc: FormService,
    private readonly dmSvc: DocsMenuService,
    private readonly ddbSvc: DocsDashBoardService,
  ) {}

  /*************************** docs-menu ***************************/
  @Post('/getDocsMenus')
  async getDocsMenus(
    @Body() dto: DocsMenuReqDto,
  ): Promise<Result<DocsMenuResDto[]>> {
    return await this.dmSvc.getDocsMenus(dto);
  }

  /*************************** forms ***************************/
  @Post('/getProofForms')
  async getProofForms(@Body() dto: FormReqDto): Promise<Result<FormResDto[]>> {
    return await this.formSvc.getProofForms(dto);
  }

  @Post('/getProofForm')
  async getProofForm(
    @Body() dto: FormReqDto,
  ): Promise<Result<FormWithFieldsAndUserResType>> {
    return await this.formSvc.getProofForm(dto);
  }

  @Post('/createOrUpdateForm')
  async createOrUpdateForm(
    @Body() dto: FormWithFieldsReqType,
  ): Promise<Result<FormWithFieldsResType>> {
    return await this.formSvc.createOrUpdateForm(dto);
  }

  @Post('/deleteProofForms')
  async deleteProofForms(
    @Body('idList') idList: string[],
  ): Promise<Result<any>> {
    return this.formSvc.deleteProofForms(idList);
  }

  @Post('/deleteProofFormFields')
  async deleteProofFormFields(
    @Body('idList') idList: string[],
  ): Promise<Result<any>> {
    return this.formSvc.deleteProofFormFields(idList);
  }

  /*************************** docs ***************************/
  @Post('/createOrUpdateProof')
  async createOrUpdateProof(
    @Body() dto: DocReqDto,
  ): Promise<Result<DocResDto>> {
    return await this.docSvc.createOrUpdateProof(dto);
  }

  // 페이지네이션 목록
  @Post('/getPaginatedProofs')
  async getPaginatedProofs(
    @Body() dto: PaginationReqDto,
  ): Promise<Result<PaginationResDto>> {
    return await this.docSvc.getPaginatedProofs(dto);
  }

  @Post('/getDoc')
  async getDoc(@Body() dto: DocReqDto): Promise<Result<DocResDto>> {
    return await this.docSvc.getDoc(dto);
  }

  @Post('/getProofDashboard')
  async getProofDashboard(@Body() dto: DocReqDto): Promise<Result<DocResDto>> {
    return await this.ddbSvc.getProofDashboard(dto);
  }
}
