import {LocalStorage} from "@/util/common/storage";
import {isNotEmpty} from "@/util/validators/check-empty";
import {generateUUID} from "@/util/helpers/random-generator";
import {
	isTargetQuestion,
	isTargetSelection,
	isTargetRespondent,
} from "./etc/poll-reducer-helper";
import {
	PollType,
	QuestionType,
	RespondentType,
	ResponseTypeEnum,
	SelectionType,
} from "@/types/poll.type";

export type CurrentPollState = {
	poll: PollType;
	mode: string; // add, edit, view
	selected?: number;
};

const pollTempId = generateUUID();
const questionTempId = generateUUID();
const userId = LocalStorage.getUserId();

export const initialPollState = (): CurrentPollState => {
	const selectionTempId = generateUUID();

	return {
		selected: undefined,
		mode: "view",
		poll: {
			pollIdx: undefined, // 저장 전
			pollTempId: pollTempId,
			title: "",
			explanation: "",
			startedAt: "",
			joinUserId: "",
			joinDeptCd: "",
			creatorId: userId,
			questions: [
				{
					questionIdx: undefined,
					questionTempId: questionTempId,
					pollIdx: undefined,
					pollTempId: pollTempId,
					responseType: ResponseTypeEnum.CHECK,
					question: "",
					isRequired: 0,
					order: 1,
					selections: [
						{
							selectionTempId: selectionTempId,
							questionTempId: questionTempId,
							selection: "",
							order: 1,
						},
					],
					responses: [
						{
							responseIdx: 0,
							respondentIdx: 0,
							questionIdx: 0,
							answer: "",
						},
					],
				},
			],
			respondents: [
				{
					respondentIdx: 0,
					pollIdx: 0,
					userId: "",
					deptCd: "",
					responseStatus: undefined,
					answeredAt: "",
				},
			],
		},
	};
};

export type PollAction =
	| {type: "SET_POLL"; payload: PollType}
	| {
			type: "UPDATE_POLL_FIELD";
			payload: {
				pollTempId?: string;
				pollIdx?: number;
				name: keyof PollType;
				value: any;
			};
	  }
	| {
			type: "UPDATE_QUESTION_FIELD";
			payload: {
				questionTempId?: string;
				questionIdx?: number;
				name: keyof QuestionType;
				value: any;
			};
	  }
	| {
			type: "REORDER_QUESTIONS";
			payload: QuestionType[]; // 순서대로 정렬된 전체 questions
	  }
	| {
			type: "DELETE_QUESTION";
			payload: {
				questionTempId?: string;
				questionIdx?: number;
			};
	  }
	| {
			type: "UPDATE_SELECTION_FIELD";
			payload: {
				questionTempId?: string;
				questionIdx?: number;
				selectionTempId?: string;
				selectionIdx?: number;
				name: keyof SelectionType;
				value: any;
			};
	  }
	| {
			type: "REORDER_SELECTIONS";
			payload: {
				questionTempId?: string;
				questionIdx?: number;
				selections: SelectionType[];
			};
	  }
	| {
			type: "DELETE_SELECTION";
			payload: {
				questionTempId?: string;
				questionIdx?: number;
				selectionTempId?: string;
				selectionIdx?: number;
			};
	  }
	| {
			type: "UPDATE_RESPONDENT_FIELD";
			payload: {
				pollTempId?: string;
				pollIdx?: number;
				name: keyof RespondentType;
				value: any;
			};
	  }
	| {
			type: "UPDATE_RESPONSE_FIELD";
			payload: {
				name: string;
				questionIdx: number;
				responseIdx?: number;
				responseTempId?: string;
				answer?: string;
			};
	  }
	| {
			type: "ADD_QUESTION";
			payload: {
				pollTempId?: string;
				pollIdx?: number;
			};
	  }
	| {
			type: "ADD_SELECTION";
			payload: {
				questionTempId?: string;
				questionIdx?: number;
			};
	  }
	| {
			type: "RESET_QUESTION";
			payload: {
				questionTempId?: string;
				questionIdx?: number;
			};
	  }
	| {type: "RESET"}
	| {type: "SET_MODE"; payload: string} // add, view, edit
	| {type: "SET_SELECTED"; payload: number};

export function pollReducer(
	state: CurrentPollState,
	action: PollAction
): CurrentPollState {
	switch (action.type) {
		case "SET_POLL":
			return {
				...state,
				poll: action.payload,
			};

		case "UPDATE_POLL_FIELD":
			return {
				...state,
				poll: {
					...state.poll,
					pollTempId: action.payload.pollTempId,
					pollIdx: action.payload.pollIdx,
					[action.payload.name]: action.payload.value,
				},
			};

		case "UPDATE_QUESTION_FIELD":
			return {
				...state,
				poll: {
					...state.poll,
					questions: state.poll.questions.map((q) =>
						isTargetQuestion(q, action.payload)
							? {
									...q,
									[action.payload.name]: action.payload.value,
							  }
							: q
					),
				},
			};

		case "REORDER_QUESTIONS":
			return {
				...state,
				poll: {
					...state.poll,
					questions: action.payload,
				},
			};

		case "DELETE_QUESTION": {
			const newQuestions = state.poll.questions
				.filter((q) => !isTargetQuestion(q, action.payload))
				.map((q, idx) => ({
					...q,
					order: idx + 1, // 1부터 시작
				}));

			return {
				...state,
				poll: {
					...state.poll,
					questions: newQuestions,
				},
			};
		}

		case "UPDATE_SELECTION_FIELD":
			return {
				...state,
				poll: {
					...state.poll,
					questions: state.poll.questions.map((q) =>
						isTargetQuestion(q, action.payload)
							? {
									...q,
									selections: q?.selections?.map((s) =>
										isTargetSelection(s, action.payload)
											? {
													...s,
													[action.payload.name]:
														action.payload.value,
											  }
											: s
									),
							  }
							: q
					),
				},
			};

		case "REORDER_SELECTIONS":
			return {
				...state,
				poll: {
					...state.poll,
					questions: state.poll.questions.map((q) =>
						isTargetQuestion(q, action.payload)
							? {
									...q,
									selections: action.payload.selections,
							  }
							: q
					),
				},
			};

		case "DELETE_SELECTION":
			return {
				...state,
				poll: {
					...state.poll,
					questions: state.poll.questions.map((q) =>
						isTargetQuestion(q, action.payload)
							? {
									...q,
									selections: q?.selections?.filter(
										(s) =>
											!isTargetSelection(
												s,
												action.payload
											)
									),
							  }
							: q
					),
				},
			};

		case "UPDATE_RESPONDENT_FIELD":
			return {
				...state,
				poll: {
					...state.poll,
					respondents: state.poll.respondents.map((r, idx) =>
						isTargetRespondent(r, action.payload)
							? {
									...r,
									[action.payload.name]: action.payload.value,
							  }
							: r
					),
				},
			};

		case "UPDATE_RESPONSE_FIELD": {
			const {questionIdx, responseIdx, responseTempId, answer} =
				action.payload;
			const userId = LocalStorage.getUserId();
			const respondentIdx = state.poll.respondents?.find(
				(r) => r.userId === userId
			);

			return {
				...state,
				poll: {
					...state.poll,
					questions: state.poll.questions.map((question) => {
						if (question.questionIdx !== questionIdx)
							return question;

						const isCheckBox =
							question.responseType === ResponseTypeEnum.CHECK;

						let updatedResponses = [...(question.responses || [])];

						if (isCheckBox) {
							// 체크박스: 다중 응답 가능
							const existingResp = updatedResponses.find(
								(r) =>
									r.questionIdx === questionIdx &&
									r.answer === String(answer) // 다중 선택 위한 핵심 비교 기준
							);

							// 체크 해제 → 있으면 제거
							if (isNotEmpty(existingResp)) {
								updatedResponses = updatedResponses.filter(
									(r) =>
										r.questionIdx === questionIdx &&
										r.answer !== String(answer)
								);
							}
							// 체크 → 없으면 추가
							else {
								updatedResponses.push({
									responseTempId: responseTempId,
									respondentIdx:
										respondentIdx?.respondentIdx || 0,
									questionIdx,
									answer: String(answer),
								});
							}
						} else {
							// 단일 응답형: 항상 응답 1개만 유지
							updatedResponses = [
								{
									responseTempId: responseTempId,
									responseIdx: responseIdx,
									respondentIdx:
										respondentIdx?.respondentIdx || 0,
									questionIdx,
									answer: String(answer),
								},
							];
						}

						return {
							...question,
							responses: updatedResponses,
						};
					}),
				},
			};
		}

		case "ADD_SELECTION":
			return {
				...state,
				poll: {
					...state.poll,
					questions: state.poll.questions.map((q) => {
						if (!isTargetQuestion(q, action.payload)) return q;

						if (
							q.responseType === ResponseTypeEnum.CHECK ||
							q.responseType === ResponseTypeEnum.RADIO
						) {
							return {
								...q,
								selections: [
									...(q.selections || []),
									{
										selectionTempId: generateUUID(),
										questionTempId: q.questionTempId,
										selection: "",
										order:
											(q.selections
												? q.selections.length
												: 0) + 1,
									},
								],
							};
						}

						// 그 외 타입은 selections 추가하지 않고 원본 그대로 반환
						return q;
					}),
				},
			};

		case "ADD_QUESTION":
			const newQuestionTempId = generateUUID();
			return {
				...state,
				poll: {
					...state.poll,
					questions: [
						...state.poll.questions,
						{
							questionTempId: newQuestionTempId,
							pollIdx: action.payload.pollIdx || undefined,
							pollTempId: action.payload.pollTempId || undefined,
							responseType: ResponseTypeEnum.CHECK,
							question: "",
							isRequired: 0,
							order: state.poll.questions.length + 1,
							selections: [
								{
									selectionTempId: generateUUID(),
									questionTempId: newQuestionTempId,
									selection: "",
									order: 1,
								},
							],
						},
					],
				},
			};

		case "RESET_QUESTION":
			const resetQuestionTempId = action.payload.questionTempId;
			return {
				...state,
				poll: {
					...state.poll,
					questions: state.poll.questions.map((q) =>
						isTargetQuestion(q, action.payload)
							? {
									...q,
									question: q.question,
									responseType: ResponseTypeEnum.CHECK,
									isRequired: 0,
									selections: [
										{
											selectionTempId: generateUUID(),
											questionTempId: resetQuestionTempId,
											selection: "",
											order: 1,
										},
									],
							  }
							: q
					),
				},
			};

		case "RESET":
			return {
				...initialPollState(),
			};

		case "SET_MODE":
			return {
				...state,
				mode: action.payload,
			};

		case "SET_SELECTED":
			return {
				...state,
				selected: action.payload,
			};

		default:
			return state;
	}
}
