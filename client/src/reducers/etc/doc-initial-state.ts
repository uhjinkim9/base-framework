import {
	DocStateType,
	DocStatusEnum,
	FormType,
} from "@/components/src/docs/etc/docs.type";

export const initialDocState: DocStateType = {
	selected: undefined,
	mode: "view",
	doc: {
		idx: undefined,
		formId: "",
		docId: "",
		docNm: "",
		docHtml: "",
		status: DocStatusEnum.SUBMITTED,
		isUrgent: false,
		isTempSaved: false,
		isScheduled: false,
		creatorId: "",
		updaterId: "",
		createdAt: null,
		updatedAt: null,
		deletedAt: null,
	},
};

export const initialFormState: FormType = {
	idx: undefined,
	formKind: "",
	formId: "",
	formNm: "",
	explanation: "",
	templateHtml: "",
	managerId: "",
	stampId: "",
	approvalRequired: false,
	isUsed: false,
	seqNum: 0,
	creatorId: "",
	updaterId: "",
	createdAt: null,
	updatedAt: null,
};
