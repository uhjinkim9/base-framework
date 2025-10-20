import {SideBarMenuType} from "@/types/menu.type";

export type PostType = {
	postIdx?: number;
	menuId?: string;
	title?: string;
	content?: string;
	fileIdxes?: string;
	prefixId?: string;

	isTempSaved?: boolean; // 임시 저장 여부
	isScheduled?: boolean; // 예약 게재 여부
	isNotice?: boolean; // 공지 여부

	noticeStartedAt?: string;
	noticeEndedAt?: string;
	scheduledAt?: string;

	creatorId?: string;
	updaterId?: string;

	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date;

	viewCount?: number;
	commentCount?: number;
	scrapCount?: number;
	scrap?: boolean; // 사용자가 스크랩했는지 여부
};

export type CommentType = {
	cmtIdx?: number; // 댓글 고유 ID (생성 시엔 없음)
	postIdx: number; // 연결된 게시글 ID
	comment: string; // 댓글 내용
	creatorId?: string; // 작성자 ID

	createdAt?: Date; // 생성일 (조회용)
	updatedAt?: Date; // 수정일 (조회용)
	deletedAt?: Date; // 삭제일 (soft-delete 시)
};

export type ViewCountType = {
	postIdx: number; // 게시글 ID
	viewerId: string; // 조회자 ID
	viewCount: number; // 조회 수
};

export type AttachedFileType = {
	fileIdx?: number; // 파일 인덱스 (옵셔널: 등록 전에는 없을 수 있음)
	fileType: string; // 파일 유형 (ex: image/png, application/pdf)
	fileName: string; // 파일 이름
	fileSize?: string; // 파일 크기 (문자열로, "1.2MB" 등)
	filePath: string; // 파일 저장 경로
	createdAt?: Date; // 업로드 일시 (조회 시만 필요)
	moduleNm?: string; // 모듈 이름

	postIdx?: number; // 연관 게시물 ID (post.postIdx)
};

export type BoardSettingType = {
	idx?: number;
	menuId?: string;
	boardType?: string;
	usingPrefix?: boolean;
	allowedCmt?: boolean;
	isAnonymous?: boolean;
	readableUsers?: string;
	readableDepts?: string;
	writableUsers?: string;
	writableDepts?: string;
	createdAt?: string;
	updatedAt?: string;
};

/*************************** 기타 ***************************/

export type PostStateType = {
	selected?: number;
	mode: string; // add, edit, view
	post: PostType;
};

export type BoardStateType = {
	selected?: number;
	mode: string;
	board: SideBarMenuType;
};

export type BoardMenusType = {
	cpBoards: SideBarMenuType[];
	psBoards: SideBarMenuType[];
};
