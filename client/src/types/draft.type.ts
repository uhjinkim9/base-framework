export interface DraftFormType {
  draftFormId: string; // 서식 ID
  draftFormNm: string; // 서식 이름
  memo: string; // 설명
  formGroup: string; // 양식 그룹
  isExternal: boolean; // 외부문서 구분 (0: 내부, 1: 외부)
  formStructure: string; // 서식 필드 구조 (JSON 형태)
  inputGuide: string; // 작성 가이드
  definedLineId: string; // 서식 자동 지정 결재선 ID
  isUse: boolean; // 사용 여부
  webhookOnDraft: string; // 기안시 Webhook (외부문서일 경우만)
  webhookOnApproval: string; // 결재시 Webhook (외부문서일 경우만)
  webhookOnFinalApproval: string; // 최종결재시 Webhook (외부문서일 경우만)
  webhookOnFinalReject: string; // 반려시 Webhook (외부문서일 경우만)
  seqNum: number; // 순번
  creatorId: string; // 생성자 ID
  updaterId?: string; // 변경자 ID (nullable)
  createdAt: Date; // 등록일
  updatedAt?: Date; // 변경일 (nullable)
}
