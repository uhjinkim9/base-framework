import {HttpStatus, Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, In, Repository} from "typeorm";
import {HttpService} from "@nestjs/axios";
import {firstValueFrom} from "rxjs";

import {Result} from "src/common/util/result";
import {partialDto} from "src/common/util/partial-dto";

import {MetaFieldEntity} from "../entities/meta-field.entity";
import {FormEntity} from "../entities/form.entity";

import {FormReqDto} from "../dto/req/form.req-dto";
import {FormResDto} from "../dto/res/form.res-dto";
import {MetaFieldResDto} from "../dto/res/meta-field.res-dto";
import {plainToInstance} from "class-transformer";
import {return404ErrorIfEmpty} from "src/common/util/check-empty";
import {
  FormWithFieldsReqType,
  FormWithFieldsResType,
  FormWithFieldsAndUserResType,
} from "../etc/doc.type";
import {externalPost} from "src/common/util/axios";

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

  async getProofForms(dto: FormReqDto): Promise<Result<FormResDto[]>> {
    const partial = partialDto(dto);
    const forms = await this.formRepo.find({
      where: {...partial, isUsed: 1},
      order: {
        seqNum: "ASC",
      },
    });
    return404ErrorIfEmpty(forms, "docs > proof 양식 없음");
    const res = plainToInstance(FormResDto, forms);
    return Result.success(res, `getProofForms 양식 조회 완료`);
  }

  async getProofForm(
    dto: FormReqDto,
  ): Promise<Result<FormWithFieldsAndUserResType>> {
    const partial = partialDto(dto);
    const userId = dto.payload?.userId;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const form = await qr.manager.findOne(this.formRepo.target, {
        where: {...partial},
      });
      return404ErrorIfEmpty(form, "제증명 양식 찾을 수 없음");

      const formId = form.formId;
      const ff = await qr.manager.find(this.ffRepo.target, {
        where: {formId},
      });
      return404ErrorIfEmpty(ff, "제증명 양식 항목 찾을 수 없음");

      // ERP 사용자 정보 조회
      let userErpInfo = null;
      try {
        const erpRawResponse: any = await externalPost(
          process.env.ERP_API_BASE_URL + "/apiKey/hr/erpEmpsList.do",
          {userId: userId},
        );

        const erpResponse = erpRawResponse[0];
        this.logger.log(`[getProofForm] erpResponse: ${erpResponse}`);

        if (erpResponse) {
          // ff에서 ##필드명## 패턴을 찾아서 해당하는 ERP 정보만 추출
          const filteredUserInfo = {};
          ff.forEach((field) => {
            if (
              field.type &&
              field.type.startsWith("##") &&
              field.type.endsWith("##")
            ) {
              const fieldName = field.type.replace(/##/g, ""); // ##korNm## → korNm
              if (erpResponse[fieldName] !== undefined) {
                filteredUserInfo[fieldName] = erpResponse[fieldName];
              }
            }
          });

          userErpInfo = filteredUserInfo;
        }
      } catch (err) {
        console.error("[getProofForm] ERP 정보 조회 실패:", err?.message);
        console.error("[getProofForm] ERP 에러 상세:", err);
      }
      this.logger.log(`[getProofForm] userErpInfo: ${userErpInfo[0]}`);

      const res: FormWithFieldsAndUserResType = {
        form: plainToInstance(FormResDto, form),
        fields: plainToInstance(MetaFieldResDto, ff),
        user: userErpInfo,
      };

      await qr.commitTransaction();

      return Result.success(res, `getProofForm: 제증명 양식 조회 완료`);
    } catch (err) {
      console.error("[getProofForm] 트랜잭션 에러:", err?.message);
      await qr.rollbackTransaction();
      return Result.error(HttpStatus.BAD_REQUEST, "쿼리 실행 실패, 롤백");
    } finally {
      await qr.release();
    }
  }

  async createOrUpdateForm(
    dto: FormWithFieldsReqType,
  ): Promise<Result<FormWithFieldsResType>> {
    const {form: formDto, fields} = dto;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const savedForm = await qr.manager.save(this.formRepo.target, formDto);
      return404ErrorIfEmpty(savedForm, "제증명 양식 등록되지 않음");
      const formId = savedForm.formId;

      // 기존 필드들 삭제 (해당 formId에 연결된 모든 필드) -> 아예 교체하기 위함
      await qr.manager.delete(this.ffRepo.target, {formId});

      // 새 필드들 삽입
      const ff = await qr.manager.save(
        this.ffRepo.target,
        fields.map((f) => ({...f, formId})),
      );
      return404ErrorIfEmpty(ff, "제증명 양식 항목 등록되지 않음");

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
