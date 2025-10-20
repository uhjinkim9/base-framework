export enum WorkStatusEnum {
  ABSENT = "absent",
  LEAVE = "leave",
  HOLIDAY = "holiday",
  CHECK_IN = "checkIn",
  CHECK_OUT = "checkOut",
  NOT_CHECKED = "notChecked",
}

export type EmployeeType = {
  userId?: string;
  empNo?: string;
  companyId?: string;
  companyNm?: string;
  korNm?: string;
  engNm?: string;
  empType?: string;
  empTypeNm?: string;
  jobType?: string;
  jobTypeNm?: string;
  deptCd?: string;
  deptNm?: string;
  dutyCd?: string;
  dutyNm?: string;
  posCd?: string;
  posNm?: string;
  homeTel?: string;
  mobile?: string;
  email?: string;
  extEmail?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  mngCompany?: string;
  workPeriod?: string;
  jobGroup?: string;
  jobGroupNm?: string;
  newEmpNo?: string;
  connectedEmpNo?: string;
  groupUserMappings?: GroupUserMappingType[];
  attendanceLogs?: AttendanceLogType[];
  leaveRequests?: LeaveRequestType[];
  approvedLeaveRequests?: LeaveRequestType[];
  workCalendarEvents?: WorkCalendarType[];
};

export type AttendanceLogType = {
  logIdx?: number;
  userId?: string;
  workDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  workMin?: number;
  overtimeMin?: number;
  nightMin?: number;
  holidayMin?: number;
  status?: WorkStatusEnum;
  employee?: EmployeeType;
};

export type WorkPolicyType = {
  policyId?: string;
  policyNm?: string;
  weeklyHours?: number;
  breakStart?: string;
  breakEnd?: string;
  coreStart?: string;
  coreEnd?: string;
  defaultStart?: string;
  defaultEnd?: string;
  autoCheckout?: boolean;
  empWorkPolicy?: PolicyGroupMappingType[];
};

export type EmpPolicyGroupType = {
  groupIdx?: number;
  groupNm?: string;
  policyMappings?: PolicyGroupMappingType[];
};

export type PolicyGroupMappingType = {
  policyId?: string;
  groupIdx?: number;
  workPolicy?: WorkPolicyType;
  policyGroup?: EmpPolicyGroupType;
};

export type GroupUserMappingType = {
  mappingIdx?: number;
  groupIdx?: number;
  userId?: string;
  policyGroup?: EmpPolicyGroupType;
  employee?: EmployeeType;
};

export type WorkCalendarType = {
  calId?: number;
  userId?: string;
  eventDate?: string;
  eventType?: string;
  title?: string;
  refId?: number;
  description?: string;
  allDay?: boolean;
  startTime?: string;
  endTime?: string;
  employee?: EmployeeType;
};

export type LeaveRequestType = {
  leaveId?: number;
  userId?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  approvalStatus?: string;
  paidHours?: number;
  reason?: string;
  approvedBy?: string;
  approvedAt?: string;
  employee?: EmployeeType;
  approver?: EmployeeType;
};

export type DashboardData = {
  checkInTime: string;
  checkOutTime: string;
  dayWorkTime: string;
  dayRemainedWorkTime: string;
  dayOverWorkTime: string;
  weekWorkTime: string;
  weekRemainedWorkTime: string;
  weekOverWorkTime: string;
  monthWorkTime: string;
  week1WorkTime: string;
  week2WorkTime: string;
  week3WorkTime: string;
  week4WorkTime: string;
  week5WorkTime: string;
  monthRemainedWorkTime: string;
  monthOverWorkTime: string;
  absentDate: string[];
  absentCount: number;
  lateDate: string[];
  lateCount: number;
};
