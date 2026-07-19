import {HttpStatus, Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, In, Repository} from "typeorm";
import {HttpService} from "@nestjs/axios";

import {Result} from "src/common/util/result";
import {partialDto} from "src/common/util/partial-dto";

import {MetaFieldEntity} from "../entities/meta-field.entity";
import {FormEntity} from "../entities/form.entity";

import {FormReqDto} from "../dto/req/form.req-dto";
import {FormResDto} from "../dto/res/form.res-dto";
import {MetaFieldResDto} from "../dto/res/meta-field.res-dto";
import {plainToInstance} from "class-transformer";
import {FormWithFieldsReqType, FormWithFieldsResType} from "../etc/doc.type";

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  constructor(
    @InjectRepository(FormEntity)
    private formRepo: Repository<FormEntity>,

    @InjectRepository(MetaFieldEntity)
    private ffRepo: Repository<MetaFieldEntity>,

    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
  ) {}

  async createOrUpdateForm(
    dto: FormWithFieldsReqType,
  ): Promise<Result<FormWithFieldsResType>> {
    const {form: formDto, fields} = dto;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const savedForm = await qr.manager.save(this.formRepo.target, formDto);
      const formId = savedForm.formId;

      // 기존 필드들 삭제 (해당 formId에 연결된 모든 필드) -> 아예 교체하기 위함
      await qr.manager.delete(this.ffRepo.target, {formId});

      // 새 필드들 삽입
      const ff = await qr.manager.save(
        this.ffRepo.target,
        fields.map((f) => ({...f, formId})),
      );

      const res: FormWithFieldsResType = {
        form: plainToInstance(FormResDto, savedForm),
        fields: plainToInstance(MetaFieldResDto, ff),
      };

      await qr.commitTransaction(); // 트랜잭션 커밋

      return Result.success(res, `createOrUpdateForm: 제증명 양식 등록 완료`);
    } catch (err) {
      await qr.rollbackTransaction();
      return Result.error(HttpStatus.BAD_REQUEST, "쿼리 실행 실패, 롤백");
    } finally {
      await qr.release();
    }
  }

  async deleteProofForms(idList: string[]): Promise<Result<any>> {
    const deletedForm = await this.formRepo.softDelete({
      formId: In(idList),
    });
    const deletedFf = await this.deleteProofFormFields(idList);
    return Result.success(
      {deletedForm, deletedFf},
      "양식 개요 및 항목 삭제 완료",
    );
  }

  async deleteProofFormFields(idList: string[]): Promise<Result<any>> {
    const deletedFf = await this.ffRepo.delete({
      id: In(idList),
    });
    return Result.success(deletedFf, "양식 개요 및 항목 삭제 완료");
  }
}
