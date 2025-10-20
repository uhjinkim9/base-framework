import {ModeType} from "@/types/common.type";

export type FormType = {
	idx?: number;
	formKind?: string;
	formId: string;
	formNm: string;
	explanation?: string;
	templateHtml: string;
	managerId?: string;
	stampId?: string;
	approvalRequired?: boolean;
	isUsed?: boolean;
	seqNum?: number;
	creatorId?: string;
	updaterId?: string;
	createdAt?: Date | null;
	updatedAt?: Date | null;
	deletedAt?: Date | null;
};

export enum DocStatusEnum {
	SUBMITTED = "submitted", // 제출 또는 신청
	APPROVED = "approved", // 승인
	REJECTED = "rejected", // 반려
	CANCELED = "canceled", // 취소
}

export type DocType = {
	idx?: number;
	formId: string;
	docId?: string;
	docNm?: string;
	docHtml?: string;
	status?: DocStatusEnum;
	isUrgent?: boolean;
	isTempSaved?: boolean;
	isScheduled?: boolean;
	reviewerId?: string;
	reviewComment?: string;
	reviewedAt?: string;
	scheduledAt?: string;
	creatorId?: string;
	updaterId?: string;
	createdAt?: Date | null;
	updatedAt?: Date | null;
	deletedAt?: Date | null;
};

export type DocStateType = {
	doc: DocType;
	mode: ModeType;
	selected?: number | string;
};
