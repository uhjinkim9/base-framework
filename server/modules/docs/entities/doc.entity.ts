import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  DeleteDateColumn,
} from 'typeorm';

import { DocStatusEnum } from '../etc/doc.type';

@Entity('doc')
@Unique('UQ_doc_doc_id', ['docId'])
export class DocEntity {
  @PrimaryGeneratedColumn({
    name: 'idx',
    type: 'int',
  })
  idx: number;

  @Index('IX_doc_form_id')
  @Column({
    name: 'form_id',
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: '연결된 양식 코드',
  })
  formId: string;

  @Column({
    name: 'doc_id',
    type: 'varchar',
    length: 30,
    nullable: true,
    comment: '문서 코드',
  })
  docId: string;

  @Index('IX_doc_doc_nm')
  @Column({
    name: 'doc_nm',
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: '문서 이름',
  })
  docNm: string;

  @Column({
    name: 'doc_html',
    type: 'text',
    nullable: false,
    comment: '문서 HTML',
  })
  docHtml: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: DocStatusEnum.SUBMITTED,
    comment: '진행 상태: submitted/approved/rejected/canceled',
  })
  status: DocStatusEnum;

  @Column({
    name: 'is_urgent',
    type: 'tinyint',
    width: 1,
    default: 0,
    nullable: false,
    comment: '긴급 여부',
  })
  isUrgent: number;

  @Column({
    name: 'is_temp_saved',
    type: 'tinyint',
    width: 1,
    default: 0,
    nullable: false,
    comment: '임시 저장 여부',
  })
  isTempSaved: number;

  @Column({
    name: 'is_scheduled',
    type: 'tinyint',
    width: 1,
    default: 0,
    nullable: false,
    comment: '예약 상신 여부',
  })
  isScheduled: number;

  @Column({
    name: 'reviewer_id',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '승인/반려 담당자 ID',
  })
  reviewerId: string;

  @Column({
    name: 'review_comment',
    type: 'text',
    nullable: true,
    comment: '승인/반려 의견',
  })
  reviewComment: string;

  @Column({
    name: 'reviewed_at',
    type: 'datetime',
    nullable: true,
    comment: '승인/반려 처리일',
  })
  reviewedAt: Date;

  @Index('IX_doc_creator_id')
  @Column({
    name: 'creator_id',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '요청자 ID',
  })
  creatorId: string;

  @Column({
    name: 'updater_id',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '변경자 ID',
  })
  updaterId: string;

  @Column({
    name: 'scheduled_at',
    type: 'datetime',
    nullable: true,
    comment: '예약일',
  })
  scheduledAt: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    nullable: false,
    comment: '등록일',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    nullable: false,
    comment: '변경일',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'datetime',
    nullable: true,
    comment: '삭제일(soft delete)',
  })
  deletedAt?: Date;
}
