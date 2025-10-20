// dayoff.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { PlanEntity } from './plan.entity';
import { HalfOffTypes, OffTypes } from '../etc/plan.enum';

@Entity('dayoffs')
export class DayoffEntity {
  @PrimaryGeneratedColumn({ name: 'dayoff_idx', type: 'int' })
  dayoffIdx: number;

  @Column({ name: 'plan_idx', type: 'int' })
  planIdx: number;

  @Column({ type: 'text', nullable: true })
  memo: string;

  @Column({ name: 'off_type', type: 'enum', enum: OffTypes })
  offType: OffTypes;

  @Column({ name: 'half_off', type: 'enum', enum: HalfOffTypes })
  halfOff: HalfOffTypes;

  @Column({ name: 'off_days', type: 'float' })
  offDays: number;

  @OneToOne(() => PlanEntity, (plan) => plan.dayoff, {
    createForeignKeyConstraints: false, // 참조는 가능하지만 DB상 물리적인 FK는 생성되지 않는 옵션
  })
  // auto_increment라 JoinColumn 인자 객체 내부 속성으로
  // referencedColumnName: 'planIdx' 생략해도 됨
  @JoinColumn({ name: 'plan_idx' })
  plan: PlanEntity;
}
