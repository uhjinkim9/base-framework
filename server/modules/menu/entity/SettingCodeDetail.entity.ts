import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SettingCodeEntity } from './SettingCode.entity';

/**
 * @fileoverview SettingCodeDetail 엔티티
 * @description 게시판 설정 코드 상세 내용을 저장하는 테이블(필요한 경우)
 *
 * @author 김어진
 * @created 2025-03-31
 * @version 1.0.0
 */
@Entity('setting_code_detail')
export class SettingCodeDetailEntity {
  /** 설정 상세 인덱스 */
  @PrimaryGeneratedColumn({
    name: 'detail_idx',
    type: 'int',
    comment: '설정 상세 인덱스',
  })
  detailIdx: number;

  /** 설정 코드 분류(setting_code 테이블 참조) */
  @Column({
    name: 'code_class',
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: '설정 코드 분류',
  })
  codeClass: string;

  /** 설정 코드 */
  @Column({
    name: 'code',
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: '설정 코드',
  })
  code: string;

  /** 설정 이름(SelectBox 또는 다른 input에 노출될 이름) */
  @Column({
    name: 'code_nm',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '설정 이름',
  })
  codeNm: string | null;

  /** 입력란 렌더링할 경우 input 유형 */
  @Column({
    name: 'setting_input',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '입력란 렌더링할 경우 input 유형',
  })
  settingInput: string;

  @ManyToOne(() => SettingCodeEntity, (codeGroup) => codeGroup.detail, {
    createForeignKeyConstraints: false, // 참조는 가능하지만 DB상 물리적인 FK는 생성되지 않는 옵션
  })
  @JoinColumn({ name: 'code_class', referencedColumnName: 'codeClass' })
  codeGroup: SettingCodeEntity;
}
