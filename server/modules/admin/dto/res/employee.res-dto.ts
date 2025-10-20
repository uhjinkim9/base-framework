import {Expose} from "class-transformer";

export class EmployeeResDto {
  @Expose()
  userId: string;

  @Expose()
  empNo: string;

  @Expose()
  companyId: string;

  @Expose()
  companyNm: string;

  @Expose()
  korNm: string;

  @Expose()
  engNm: string;

  @Expose()
  empType: string;

  @Expose()
  empTypeNm: string;

  @Expose()
  jobType: string;

  @Expose()
  jobTypeNm: string;

  @Expose()
  deptCd: string;

  @Expose()
  deptNm: string;

  @Expose()
  dutyCd: string;

  @Expose()
  dutyNm: string;

  @Expose()
  posCd: string;

  @Expose()
  posNm: string;

  @Expose()
  homeTel: string;

  @Expose()
  mobile: string;

  @Expose()
  email: string;

  @Expose()
  extEmail: string;

  @Expose()
  leaveStartDate: string;

  @Expose()
  leaveEndDate: string;

  @Expose()
  mngCompany: string;

  @Expose()
  workPeriod: string;

  @Expose()
  jobGroup: string;

  @Expose()
  jobGroupNm: string;

  @Expose()
  newEmpNo: string;

  @Expose()
  connectedEmpNo: string;
}
