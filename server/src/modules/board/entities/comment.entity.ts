import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {PostEntity} from "./post.entity";

@Entity("board_comments")
export class CommentEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({type: "text"})
  content: string;

  @Column({length: 100})
  authorId: string;

  @ManyToOne(() => PostEntity, {onDelete: "CASCADE"})
  post: PostEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
