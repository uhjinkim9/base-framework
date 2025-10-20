export interface DraftFormData {
  formId: string;
  content: string;
  attachments: number[];
  approvalLines: string[];
}

export interface DraftBasicData {
  draftId?: string;
  draftNm?: string;
  draftFormId?: string;
  draftContent?: string;
  attachments?: number[];
  approvalLines?: string[];
}

export interface ApprovalLine {
  id: string;
  name: string;
  position: string;
  department: string;
  date: string;
  gubun: string;
}

export interface AttachmentFile {
  id: string;
  name: string;
  size: string;
}
