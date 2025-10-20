export type PollMenuType = {
	idx?: number;
	menuId: string;
	menuNm: string;
	nodeLevel: number;
	upperNode: string; // 상위 노드 ID
	memo: string | null; // 설명
	isUsed: boolean;
	seqNum: number; // 정렬 순서
	creatorId: string;
	updaterId?: string;
	children?: PollMenuType[]; // 자식 메뉴 (재귀 구조)
	parent?: PollMenuType; // 상위 메뉴 (선택적)
};

export type PollType = {
	pollIdx?: number; // 백엔드에서 자동 생성
	pollTempId?: string; // 프론트에서만 식별자 역할
	title?: string;
	explanation?: string; // 프론트에서만 식별자 역할
	startedAt?: string;
	endedAt?: string;
	joinUserId?: string;
	joinDeptCd?: string;
	revealResult?: boolean; // 결과 공개 여부
	modifyAfterAnswered?: boolean; // 참여 후 수정 허용 여부
	isAnonymous?: boolean; // 익명 참여 여부
	completedRespondents?: number; // 익명일 때 응답 완료자 수(아근데 익명일때만 할필욘없으려나 아 좀더 고민해봐야겠다)
	totalRespondents?: number; // 익명일 떄 전체 응답자 수
	creatorId?: string;
	updaterId?: string;
	createdAt?: Date;
	updatedAt?: Date;

	questions: QuestionType[];
	respondents: RespondentType[];
};

export type QuestionType = {
	questionIdx?: number;
	questionTempId?: string; // 프론트에서만 식별자 역할
	pollIdx?: number;
	pollTempId?: string;
	responseType?: ResponseTypeEnum;
	question?: string;
	isRequired?: number;
	order?: number;

	selections?: SelectionType[];
	responses?: ResponseType[];
};

export type SelectionType = {
	selectionIdx?: number;
	selectionTempId?: string; // 프론트에서만 식별자 역할
	questionIdx?: number;
	questionTempId?: string; // 프론트에서만 식별자 역할
	selection?: string;
	order?: number;
};

export type RespondentType = {
	respondentIdx?: number;
	pollIdx?: number;
	pollTempId?: string; // 프론트에서만 식별자 역할
	userId?: string;
	deptCd?: string;
	responseStatus?: ResponseStatus;
	answeredAt?: string;
};

export type ResponseType = {
	responseIdx?: number;
	responseTempId?: string;
	respondentIdx: number;
	questionIdx?: number;
	answer: string;
};

export enum ResponseTypeEnum {
	CHECK = "check", // 다중 선택
	RADIO = "radio", // 단일 선택
	SHORT_TEXT = "short-text", // 단답형
	LONG_TEXT = "long-text", // 장답형
	NUMBER = "number", // 숫자 입력
	DATE = "date", // 날짜 입력
	SCORE = "score", // 점수
}

// export enum VisibilityType {
// 	PRIVATE = "private", // 본인만 보기
// 	DEPARTMENT = "department", // 부서 공개
// 	DIVISION = "division", // 본부 공개
// 	PUBLIC = "public", // 전체 조직 공개
// }

export enum ResponseStatus {
	PENDING = "PENDING", // 응답 전
	COMPLETED = "COMPLETED", // 응답 완료
}

/*************************** 기타 ***************************/

/** CheckBox 또는 Radio 타입인지 체크
 * @returns {boolean}
 */
export const checkIsSelectableType = (responseType?: string) => {
	const isCheckOrRadio =
		responseType === ResponseTypeEnum.CHECK ||
		responseType === ResponseTypeEnum.RADIO;
	return isCheckOrRadio;
};

/** 설문 결과 엑셀 다운로드 관련 */
// 헤더
export const resultHeaders = [
	"순서",
	"질문",
	"사번",
	"아이디",
	"성명",
	"부서",
	"답변",
];
