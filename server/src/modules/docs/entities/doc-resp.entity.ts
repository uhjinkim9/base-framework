import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MetaFieldEntity } from './meta-field.entity';

/**
 * 양식 항목에 따른 응답 저장 테이블
 */

@Entity('doc_resp')
@Index('IX_doc_response_doc_id', ['docId'])
@Index('IX_doc_response_doc_field', ['docId', 'formFieldIdx']) // 복합 인덱스
export class DocRespEntity {
  @PrimaryGeneratedColumn({
    name: 'idx',
    type: 'int',
  })
  idx: number;

  @Index('IX_doc_basic_form_id')
  @Column({
    name: 'doc_id',
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: '연결된 문서 코드',
  })
  docId: string;

  /** 편의상 중복 보관(조인 줄이기용). 없어도 무방 */
  @Index('IX_doc_response_form_id')
  @Column({
    name: 'form_id',
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: '연결된 양식 코드 (docs_form.form_id)',
  })
  formId: string;

  @Index('IX_doc_basic_doc_nm')
  @Column({
    name: 'doc_nm',
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: '문서 이름',
  })
  docNm: string;

  // 응답(결과) 필드 시작

  @Column({
    name: 'form_field_idx',
    type: 'int',
    comment: '양식 항목 IDX',
  })
  formFieldIdx?: number;

  @Column({
    name: 'field_value',
    type: 'text',
    nullable: false,
    comment: '항목 입력 값',
  })
  fieldValue?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    comment: '등록일',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    comment: '변경일',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'datetime',
    comment: '삭제일(soft delete)',
  })
  deletedAt?: Date;

  @ManyToOne(() => MetaFieldEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'form_field_id', referencedColumnName: 'id' })
  field: MetaFieldEntity;
}
