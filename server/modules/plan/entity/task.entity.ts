// task.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { PlanEntity } from './plan.entity';

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn({ name: 'task_idx', type: 'int' })
  taskIdx: number;

  @Column({ name: 'plan_idx', type: 'int' })
  planIdx: number;

  @Column({ type: 'text', nullable: true })
  memo: string;

  @OneToOne(() => PlanEntity, (plan) => plan.task, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'plan_idx' })
  plan: PlanEntity;
}
