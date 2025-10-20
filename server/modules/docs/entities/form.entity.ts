import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('form')
@Index(['formId'], { unique: true }) // 비즈니스 키 UNIQUE + 인덱스
export class FormEntity {
  @PrimaryGeneratedColumn({
    name: 'idx',
    type: 'int',
  })
  idx: number;

  @Column({
    name: 'form_kind',
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: '제증명 종류',
  })
  formKind: string;

  @Column({
    name: 'form_id',
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: '문서 번호에 들어갈 양식 코드',
  })
  formId: string;

  @Column({
    name: 'form_nm',
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: '양식 이름',
  })
  formNm: string;

  @Column({
    name: 'explanation',
    type: 'text',
    nullable: true,
    comment: '설명/안내',
  })
  explanation: string;

  @Column({
    name: 'template_html',
    type: 'text',
    nullable: false,
    comment: '템플릿 HTML',
  })
  templateHtml: string;

  @Column({
    name: 'manager_id',
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: '담당자 ID',
  })
  managerId: string;

  @Column({
    name: 'stamp_id',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '도장 ID',
  })
  stampId: string;

  @Column({
    name: 'approval_required',
    type: 'tinyint',
    width: 1,
    default: 1,
    nullable: false,
    comment: '승인 필요 여부',
  })
  approvalRequired: number;

  @Column({
    name: 'is_used',
    type: 'tinyint',
    width: 1,
    default: 1,
    nullable: false,
    comment: '양식 사용 여부',
  })
  isUsed: number;

  @Column({
    name: 'seq_num',
    type: 'int',
    default: 1,
    nullable: false,
    comment: '정렬 순서',
  })
  seqNum: number;

  @Column({
    name: 'creator_id',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '등록자 ID',
  })
  creatorId: string | null;

  @Column({
    name: 'updater_id',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '변경자 ID',
  })
  updaterId: string | null;

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
}
