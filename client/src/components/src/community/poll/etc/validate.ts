import AlertService from "@/services/alert.service";
import {PollType, ResponseTypeEnum} from "@/types/poll.type";

export const validatePoll = (poll: PollType): boolean => {
	const errors: string[] = [];

	// 필수값 검증
	if (!poll.title || poll.title.trim() === "") {
		errors.push("설문 제목을 입력해주세요.");
	}
	if (!poll.startedAt || !poll.endedAt) {
		errors.push("설문 기간을 설정해주세요.");
	}
	if (!poll.joinUserId && !poll.joinDeptCd) {
		errors.push("응답 대상을 설정해주세요.");
	}
	if (!poll.explanation || poll.explanation.trim() === "") {
		errors.push("설문 안내를 입력해주세요.");
	}
	if (
		!poll.questions ||
		poll.questions.length === 0 ||
		poll.questions.every((q) => !q.question || q.question.trim() === "")
	) {
		errors.push("질문을 하나 이상 추가해주세요.");
	}
	if (errors.length > 0) {
		AlertService.error(errors[0]);
		return false;
	}

	// 보기가 없을 때(CHECK/RADIO 타입만)
	const hasEmptySelections = poll.questions.some((q) => {
		const isCheck =
			q.responseType === ResponseTypeEnum.CHECK ||
			q.responseType === ResponseTypeEnum.RADIO;
		return isCheck
			? !q.selections ||
					q.selections.length === 0 ||
					// every: 전부 조건 해당되어야 true
					// some: 하나라도 조건 해당되면 true
					q.selections.some(
						(s) => !s.selection || s.selection.trim() === ""
					)
			: false;
	});
	if (hasEmptySelections) {
		errors.push("각 질문에 보기를 하나 이상 추가해주세요.");
	}
	return true;
};
