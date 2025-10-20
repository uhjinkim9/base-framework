import AlertService from "@/services/alert.service";

import {PostType} from "./board.type";

export const validatePost = (post: PostType): boolean => {
	// menuId
	if (!post.menuId || post.menuId.trim() === "") {
		AlertService.error("게시판 ID를 입력해주세요.");
		return false;
	}
	// title
	if (!post.title || post.title.trim() === "") {
		AlertService.error("게시물 제목을 입력해주세요.");
		return false;
	}
	// content
	if (!post.content || post.content.trim() === "") {
		AlertService.error("게시물 내용을 입력해주세요.");
		return false;
	}
	return true;
};
