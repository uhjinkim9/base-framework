import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity("boards")
export class BoardEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({length: 120})
  name: string;

  @Column({length: 200, nullable: true})
  description: string | null;

  @Column({default: true})
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
