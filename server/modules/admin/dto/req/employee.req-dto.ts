import {IsString, IsOptional} from "class-validator";
import {PartialType} from "@nestjs/mapped-types";
import {CommonDto} from "src/common/dto/common.dto";

export class EmployeeDto extends CommonDto {
  @IsString()
  @IsOptional()
  userId: string;

  @IsString()
  @IsOptional()
  empNo: string;

  @IsString()
  @IsOptional()
  companyId: string;

  @IsString()
  @IsOptional()
  companyNm: string;

  @IsString()
  @IsOptional()
  korNm: string;

  @IsString()
  @IsOptional()
  engNm: string;

  @IsString()
  @IsOptional()
  empType: string;

  @IsString()
  @IsOptional()
  empTypeNm: string;

  @IsString()
  @IsOptional()
  jobType: string;

  @IsString()
  @IsOptional()
  jobTypeNm: string;

  @IsString()
  @IsOptional()
  deptCd: string;

  @IsString()
  @IsOptional()
  deptNm: string;

  @IsString()
  @IsOptional()
  dutyCd: string;

  @IsString()
  @IsOptional()
  dutyNm: string;

  @IsString()
  @IsOptional()
  posCd: string;

  @IsString()
  @IsOptional()
  posNm: string;

  @IsString()
  @IsOptional()
  homeTel: string;

  @IsString()
  @IsOptional()
  mobile: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  extEmail: string;

  @IsString()
  @IsOptional()
  leaveStartDate: string;

  @IsString()
  @IsOptional()
  leaveEndDate: string;

  @IsString()
  @IsOptional()
  mngCompany: string;

  @IsString()
  @IsOptional()
  workPeriod: string;

  @IsString()
  @IsOptional()
  jobGroup: string;

  @IsString()
  @IsOptional()
  jobGroupNm: string;

  @IsString()
  @IsOptional()
  newEmpNo: string;

  @IsString()
  @IsOptional()
  connectedEmpNo: string;
}

export class EmployeeReqDto extends PartialType(EmployeeDto) {}
