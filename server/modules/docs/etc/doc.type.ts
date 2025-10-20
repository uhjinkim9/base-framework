import { FormReqDto } from '../dto/req/form.req-dto';
import { FormResDto } from '../dto/res/form.res-dto';
import { MetaFieldReqDto } from '../dto/req/meta-field.req-dto';
import { MetaFieldResDto } from '../dto/res/meta-field.res-dto';

export enum DocStatusEnum {
  SUBMITTED = 'submitted', // 제출 또는 신청
  APPROVED = 'approved', // 승인
  REJECTED = 'rejected', // 반려
  CANCELED = 'canceled', // 취소
}

export type FormWithFieldsReqType = {
  form: FormReqDto;
  fields: MetaFieldReqDto[];
};

export type FormWithFieldsResType = {
  form: FormResDto;
  fields: MetaFieldResDto[];
};

export type FormWithFieldsAndUserResType = {
  form: FormResDto;
  fields: MetaFieldResDto[];
  user?: any; // ERP 사용자 정보
};
