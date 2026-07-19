import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { FormEntity } from './form.entity';

@Entity('meta_field')
export class MetaFieldEntity {
  @Column({
    name: 'form_id',
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: '양식 코드',
  })
  formId: string;

  @PrimaryColumn({
    name: 'id',
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: '고유 ID',
  })
  id: string;

  @Column({
    name: 'tag_name',
    type: 'varchar',
    length: 30,
    nullable: true,
    comment: '태그 이름',
  })
  tagName: string;

  @Column({
    name: 'type',
    type: 'varchar',
    length: 30,
    nullable: true,
    comment: '항목 유형 (예: date, check, emp 등)',
  })
  type: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'name 속성',
  })
  name: string;

  @Column({
    name: 'value',
    type: 'text',
    nullable: true,
    comment: 'value 속성',
  })
  value: string;

  @Column({
    name: 'options',
    type: 'text',
    nullable: true,
    comment: '요소 옵션: select의 option, check의 value 등',
  })
  options: string;

  @Column({
    name: 'width',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '너비',
  })
  width: string;

  @Column({
    name: 'placeholder',
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '플레이스홀더',
  })
  placeholder: string;

  @Column({
    name: 'is_required',
    type: 'tinyint',
    default: 0,
    nullable: true,
    comment: '필수 여부',
  })
  isRequired: boolean;

  @ManyToOne(() => FormEntity, (form) => form.formId, {
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'form_id', referencedColumnName: 'formId' })
  form: FormEntity;
}
