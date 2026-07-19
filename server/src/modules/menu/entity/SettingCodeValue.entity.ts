import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * @fileoverview SettingCodeValue 엔티티
 * @description 게시판 설정 코드에 대한 값을 저장하는 테이블
 *
 * @author 김어진
 * @created 2025-03-31
 * @version 1.0.0
 */
@Entity('setting_code_value')
export class SettingCodeValue {
  /** 설정 값 인덱스 */
  @PrimaryGeneratedColumn({
    name: 'value_idx',
    type: 'int',
    comment: '설정 값 인덱스',
  })
  valueIdx: number;

  /** 설정 상세 인덱스 */
  @Column({
    name: 'detail_idx',
    type: 'int',
    comment: '설정 상세 인덱스',
  })
  detailIdx: number;

  /** 설정 값 */
  @Column({
    name: 'setting_value',
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '설정 값',
  })
  settingValue: string;
}
