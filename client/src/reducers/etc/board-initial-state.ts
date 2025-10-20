"use client";
import {
	BoardStateType,
	PostStateType,
} from "@/components/src/community/board/etc/board.type";

export const initialPostState: PostStateType = {
	selected: undefined, // postIdx
	mode: "view",
	post: {
		menuId: "",
		title: "",
		content: "",
		isTempSaved: false, // 임시 저장 여부
		isScheduled: false, // 예약 게재 여부
		isNotice: false, // 공지 여부
		noticeStartedAt: "",
		noticeEndedAt: "",
		scheduledAt: "",
	},
};

export const initialBoardState: BoardStateType = {
	selected: undefined, // menuIdx
	mode: "view",
	board: {
		menuId: "",
		menuNm: "",
		nodeLevel: 2,
		upperNode: "",
		isCustomed: true,
		isUsed: true,
		memo: "",
		seqNum: 1,
	},
};
