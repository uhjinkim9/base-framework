import { Expose, Transform } from 'class-transformer';

import { boolTransformer } from 'src/common/util/transformer';
import { FormResDto } from './form.res-dto';

export class MetaFieldResDto {
  @Expose()
  formId: string;

  @Expose()
  id: string;

  @Expose()
  tagName: string;

  @Expose()
  type: string;

  @Expose()
  name: string;

  @Expose()
  value: string;

  @Expose()
  options: string;

  @Expose()
  width: string;

  @Expose()
  placeholder: string;

  @Transform(({ value }) => boolTransformer.from(value))
  @Expose()
  isRequired: boolean;

  @Expose()
  form?: FormResDto;
}
