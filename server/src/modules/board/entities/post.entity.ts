import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {BoardEntity} from "./board.entity";

@Entity("board_posts")
export class PostEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({length: 200})
  title: string;

  @Column({type: "text"})
  content: string;

  @Column({length: 100})
  authorId: string;

  @Column({default: 0})
  viewCount: number;

  @ManyToOne(() => BoardEntity, {onDelete: "CASCADE"})
  board: BoardEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
