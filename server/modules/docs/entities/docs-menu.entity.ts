import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("docs_menus")
export class DocsMenuEntity {
  @PrimaryGeneratedColumn({
    name: "menu_idx",
    type: "int",
  })
  menuIdx: number;

  @Column({
    name: "menu_id",
    type: "varchar",
    length: 30,
    nullable: false,
    comment: "사이드바 메뉴 ID, URL에 사용",
  })
  menuId: string;

  @Column({
    name: "menu_nm",
    type: "varchar",
    length: 30,
    nullable: false,
    comment: "사이드바 메뉴 이름",
  })
  menuNm: string;

  @Column({
    name: "node_level",
    type: "int",
    nullable: false,
    comment:
      "사이드바에서만 사용하는 메뉴 노드 레벨(menu 테이블의 menu_tree와 별개), 숫자가 작을수록 상위 단계",
  })
  nodeLevel: number;

  @Column({
    name: "upper_node",
    type: "varchar",
    length: 50,
    nullable: false,
    comment: "상위 노드",
    default: "proof",
  })
  upperNode: string;

  @Column({
    name: "is_customed",
    type: "tinyint",
    width: 1,
    default: 0,
    nullable: false,
    comment: "커스텀 여부",
  })
  isCustomed: number;

  @Column({
    name: "memo",
    type: "text",
    nullable: true,
    comment: "설명",
  })
  memo: string;

  @Column({
    name: "join_emp_no",
    type: "varchar",
    length: 255,
    nullable: true,
    comment: "공유 대상자 사번(콤마 구분)",
  })
  joinEmpNo: string;

  @Column({
    name: "join_dept_cd",
    type: "varchar",
    length: 255,
    nullable: true,
    comment: "공유 대상 조직(콤마 구분)",
  })
  joinDeptCd: string;

  @Column({
    name: "is_used",
    type: "tinyint",
    width: 1,
    default: 1,
    nullable: false,
    comment: "메뉴 사용 여부",
  })
  isUsed: number;

  @Column({
    name: "seq_num",
    type: "int",
    default: 1,
    nullable: false,
    comment: "정렬 순서",
  })
  seqNum: number;

  @Column({
    name: "creator_id",
    type: "varchar",
    length: 20,
    nullable: true,
    comment: "등록자 ID",
  })
  creatorId: string | null;

  @Column({
    name: "updater_id",
    type: "varchar",
    length: 20,
    nullable: true,
    comment: "변경자 ID",
  })
  updaterId: string | null;

  @CreateDateColumn({
    name: "created_at",
    type: "datetime",
    comment: "등록일",
  })
  createdAt: Date;

  /** 변경일 */
  @UpdateDateColumn({
    name: "updated_at",
    type: "datetime",
    comment: "변경일",
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: "deleted_at",
    type: "datetime",
    comment: "삭제일(soft delete)",
  })
  deletedAt?: Date;

  @OneToMany(() => DocsMenuEntity, (doc) => doc.parent)
  children: DocsMenuEntity[];

  @ManyToOne(() => DocsMenuEntity, (parent) => parent.children, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({name: "upper_node", referencedColumnName: "menuId"})
  parent: DocsMenuEntity;
}
