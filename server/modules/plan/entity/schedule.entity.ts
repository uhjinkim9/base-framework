import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { PlanEntity } from './plan.entity';

@Entity('schedules')
export class ScheduleEntity {
  @PrimaryGeneratedColumn({ name: 'schedule_idx', type: 'int' })
  scheduleIdx: number;

  @Column({ name: 'plan_idx', type: 'int' })
  planIdx: number;

  @Column({ type: 'text', nullable: true })
  memo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({
    name: 'join_emp_no',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '공유 대상자 사번(콤마 구분)',
  })
  joinEmpNo: string;

  @Column({
    name: 'join_dept_cd',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '공유 대상 조직(콤마 구분)',
  })
  joinDeptCd: string;

  @Column({
    name: 'join_third_party',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  joinThirdParty: string;

  @OneToOne(() => PlanEntity, (plan) => plan.schedule, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'plan_idx', referencedColumnName: 'planIdx' })
  plan: PlanEntity;
}
