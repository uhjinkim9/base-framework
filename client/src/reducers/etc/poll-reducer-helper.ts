import {
	PollType,
	QuestionType,
	SelectionType,
	RespondentType,
} from "@/components/src/poll/etc/poll.type";
import {isNotEmpty} from "@/util/validators/check-empty";
import {isEmpty} from "lodash";

export const isTargetPoll = (
	mode: string,
	p: PollType,
	payload: {pollTempId?: string; pollIdx?: number}
): boolean => {
	if (mode === "add") {
		return p.pollTempId === payload.pollTempId;
	}
	if (mode === "edit") {
		return p.pollIdx === payload.pollIdx;
	}
	return false;
};

export const isTargetQuestion = (
	q: QuestionType,
	payload: {questionTempId?: string; questionIdx?: number}
): boolean => {
	const {questionTempId, questionIdx} = payload;
	if (isNotEmpty(questionTempId) && isEmpty(questionIdx)) {
		return q.questionTempId === payload.questionTempId;
	}
	if (isNotEmpty(questionIdx) && isEmpty(questionTempId)) {
		return q.questionIdx === payload.questionIdx;
	}
	return false;
};

export const isTargetSelection = (
	s: SelectionType,
	payload: {selectionTempId?: string; selectionIdx?: number}
): boolean => {
	const {selectionTempId, selectionIdx} = payload;
	if (isNotEmpty(selectionTempId) && isEmpty(selectionIdx)) {
		return s.selectionTempId === payload.selectionTempId;
	}
	if (isNotEmpty(selectionIdx) && isEmpty(selectionTempId)) {
		return s.selectionIdx === payload.selectionIdx;
	}
	return false;
};

export const isTargetRespondent = (
	r: RespondentType,
	payload: {pollTempId?: string; pollIdx?: number}
) => {
	const {pollTempId, pollIdx} = payload;
	if (isNotEmpty(pollTempId) && isEmpty(pollIdx)) {
		return r.pollTempId === payload.pollTempId;
	}
	if (isNotEmpty(pollIdx) && isEmpty(pollTempId)) {
		return r.pollIdx === payload.pollIdx;
	}
	return false;
};
