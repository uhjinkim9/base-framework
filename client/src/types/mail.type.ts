/*************************** 메일 ***************************/

export type MailType = {
  mailIdx?: number;
  menuId?: string;
  senderEmail?: string;
  subject?: string;
  message?: string;
  isRead?: boolean;
  isTempSaved?: boolean;
  isImportant?: boolean;
  isScheduled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  recipients?: RecipientType[];
};

export enum RecipientTypeEnum {
  TO = "TO",
  CC = "CC",
  BCC = "BCC",
}

export type RecipientType = {
  idx?: number;
  recipientEmail?: string;
  type?: RecipientTypeEnum;
  mailIdx?: number; // FK, 응답 시 message의 mailIdx만 노출
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

/*************************** 주소록 ***************************/

// 기존 시스템 연락처 (회사 연락처)
export type ContactType = {
  idx?: number;
  userId?: string;
  companyId?: string;
  companyNm?: string;
  empNo?: string;
  korNm?: string;
  engNm?: string;
  joinDate?: string;
  groupJoinDate?: string;
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
  birthDate?: string;
  birthMonth?: string;
  addr1?: string;
  addr2?: string;
  homeTel?: string;
  mobile?: string;
  email?: string;
  extEmail?: string;
  photo?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  probationEndDate?: string;
  contractEndDate?: string;
  mngCompany?: string;
  workPeriod?: string;
  orgPath?: string;
  jobGroup?: string;
  jobGroupNm?: string;
  newEmpNo?: string;
  connectedEmpNo?: string;
  isImportant?: boolean;
};

// 개인 연락처 (사용자가 직접 추가하는 연락처)
export type PersonalContactType = {
  idx?: number;
  userId?: string;
  korNm?: string;
  email?: string;
  mobile?: string;
  homeTel?: string;
  fax?: string;
  companyNm?: string;
  deptNm?: string;
  posNm?: string;
  address?: string;
  birthDate?: string;
  memo?: string;
  photo?: string;
  folderId?: string;
};

export enum FavoriteContactTargetEnum {
  company = "COMPANY",
  personal = "PERSONAL",
}
