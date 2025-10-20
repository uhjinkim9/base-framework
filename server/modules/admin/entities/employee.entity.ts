import {Entity, Column, PrimaryColumn, Unique, OneToMany} from "typeorm";

@Entity("employee", {
  comment:
    "userId PK로 설정한 재직 중인 임직원 정보, userId가 없는 직원은 제외",
})
@Unique(["empNo"])
export class EmployeeEntity {
  @PrimaryColumn({
    name: "user_id",
    type: "varchar",
    length: 20,
    comment: "사용자 ID",
  })
  userId: string;

  @Column({
    name: "emp_no",
    type: "varchar",
    length: 20,
  })
  empNo: string;

  @Column({name: "company_id", type: "varchar", length: 20, nullable: true})
  companyId: string;

  @Column({name: "company_nm", type: "varchar", length: 100, nullable: true})
  companyNm: string;

  @Column({name: "kor_nm", type: "varchar", length: 50, nullable: true})
  korNm: string;

  @Column({name: "eng_nm", type: "varchar", length: 50, nullable: true})
  engNm: string;

  @Column({name: "emp_type", type: "varchar", length: 10, nullable: true})
  empType: string;

  @Column({name: "emp_type_nm", type: "varchar", length: 20, nullable: true})
  empTypeNm: string;

  @Column({name: "job_type", type: "varchar", length: 10, nullable: true})
  jobType: string;

  @Column({name: "job_type_nm", type: "varchar", length: 20, nullable: true})
  jobTypeNm: string;

  @Column({name: "dept_cd", type: "varchar", length: 20, nullable: true})
  deptCd: string;

  @Column({name: "dept_nm", type: "varchar", length: 100, nullable: true})
  deptNm: string;

  @Column({name: "duty_cd", type: "varchar", length: 10, nullable: true})
  dutyCd: string;

  @Column({name: "duty_nm", type: "varchar", length: 20, nullable: true})
  dutyNm: string;

  @Column({name: "pos_cd", type: "varchar", length: 10, nullable: true})
  posCd: string;

  @Column({name: "pos_nm", type: "varchar", length: 20, nullable: true})
  posNm: string;

  @Column({name: "home_tel", type: "varchar", length: 20, nullable: true})
  homeTel: string;

  @Column({name: "mobile", type: "varchar", length: 20, nullable: true})
  mobile: string;

  @Column({name: "email", type: "varchar", length: 50, nullable: true})
  email: string;

  @Column({name: "ext_email", type: "varchar", length: 50, nullable: true})
  extEmail: string;

  @Column({
    name: "leave_start_date",
    type: "varchar",
    length: 10,
    nullable: true,
  })
  leaveStartDate: string;

  @Column({
    name: "leave_end_date",
    type: "varchar",
    length: 10,
    nullable: true,
  })
  leaveEndDate: string;

  @Column({name: "mng_company", type: "varchar", length: 100, nullable: true})
  mngCompany: string;

  @Column({name: "work_period", type: "varchar", length: 10, nullable: true})
  workPeriod: string;

  @Column({name: "job_group", type: "varchar", length: 20, nullable: true})
  jobGroup: string;

  @Column({name: "job_group_nm", type: "varchar", length: 50, nullable: true})
  jobGroupNm: string;

  @Column({name: "new_emp_no", type: "varchar", length: 20, nullable: true})
  newEmpNo: string;

  @Column({
    name: "connected_emp_no",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  connectedEmpNo: string;

  // 직원이 속한 그룹 매핑 목록
  // @OneToMany(
  //   () => GroupUserMappingEntity,
  //   (groupUserMapping) => groupUserMapping.employee,
  // )
  // groupUserMappings: GroupUserMappingEntity[];
}
