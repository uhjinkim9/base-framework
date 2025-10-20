"use client";
import styles from "./styles/AddPoll.module.scss";
import {ChangeEvent, useEffect, useRef} from "react";
import {useParams, useRouter} from "next/navigation";

import {LocalStorage} from "@/util/common/storage";
import {requestPost} from "@/util/api/api-service";
import AlertService from "@/services/alert.service";

import {usePollContext} from "@/context/PollContext";
import {responseTypeMap} from "./QuestionNodes";

import Divider from "@/components/common/segment/Divider";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import PollInfo from "./PollInfo";
import {PollType, ResponseTypeEnum} from "@/types/poll.type";

export default function RespondPoll() {
	const {state, dispatch} = usePollContext();
	const {poll} = state;

	const router = useRouter();
	const params = useParams();
	const pollIdx = Number(params.pollIdx);

	function onChangeResponse(
		e: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
		ids: {
			questionIdx: number;
			responseIdx?: number;
			responseTempId?: string;
			answer?: string;
		}
	) {
		const {name, value, type} = e.target;
		const isCheckRadio = type === "checkbox" || type === "radio";

		dispatch({
			type: "UPDATE_RESPONSE_FIELD",
			payload: {
				name,
				questionIdx: ids.questionIdx,
				responseIdx: ids.responseIdx || undefined,
				responseTempId: ids.responseTempId || "",
				answer: isCheckRadio ? ids.answer : value,
			},
		});
	}

	const userId = LocalStorage.getUserId();
	const respondentIdxRef = useRef<number | undefined>(undefined);
	const randomIdRef = useRef<number>(0);

	useEffect(() => {
		const isRespondent = poll.respondents.some((r) => r.userId === userId);
		randomIdRef.current = Math.floor(Math.random() * 90000) + 10000; // 10000부터 99999 사이의 랜덤 정수
		respondentIdxRef.current = isRespondent
			? poll.respondents.find((r) => r.userId === userId)?.respondentIdx
			: undefined;
		getPollDetail();
	}, [pollIdx]);

	async function getPollDetail() {
		const res = await requestPost("/poll/getPollDetail", {
			pollIdx: pollIdx,
			respondentIdx: respondentIdxRef.current,
		});
		if (res.statusCode === 200) {
			dispatch({type: "SET_POLL", payload: res.data});
		}
	}

	function validatePoll(poll: PollType): boolean {
		for (const q of poll.questions) {
			if (q.isRequired) {
				// 선택형 질문 (CHECK/RADIO)인 경우
				const isSelectable =
					q.responseType === ResponseTypeEnum.CHECK ||
					q.responseType === ResponseTypeEnum.RADIO;

				const isEmpty = isSelectable
					? !q.responses || q.responses.length === 0
					: !q.responses ||
					  q.responses.some((r) => !r || r.answer?.trim?.() === "");

				if (isEmpty) {
					AlertService.error(`${q.order}번 질문에 응답해 주세요.`);
					return false;
				}
			}
		}
		return true;
	}

	async function onSubmitResponse() {
		const validationCheck = validatePoll(poll);
		if (!validationCheck) return;

		const res = await requestPost(
			"/poll/createOrUpdateResponse",
			poll.questions
		);
		if (res.statusCode === 200) {
			router.push("../");
			AlertService.success("설문 응답이 완료되었습니다.");
			dispatch({type: "RESET"});
		} else {
			console.log(res);
		}
	}

	return (
		<div>
			<PollInfo />
			<div className={styles.questionsWrapper}>
				{poll?.questions
					?.slice() // 원본 배열 변형 방지
					.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // sort(compareFunction)
					.map((question, quesIdx) => (
						<div key={quesIdx} className={styles.questionNodes}>
							<div className="row">
								{question?.isRequired && (
									<span className={styles.required}>*</span>
								)}
								<p>
									{question?.order}. {question?.question}
								</p>
							</div>

							<div
								key={randomIdRef.current}
								className={`row ${styles.respSelWrapper}`}
							>
								{question?.responseType &&
									(question?.responseType === "check" ||
									question?.responseType === "radio"
										? question.selections?.map(
												(selection) => {
													const isChecked =
														question?.responses?.some(
															(res) =>
																String(
																	res.answer
																) ===
																String(
																	selection?.selectionIdx
																)
														);
													const matchedResponse =
														question.responses?.find(
															(res) =>
																String(
																	res.answer
																) ===
																String(
																	selection?.selectionIdx
																)
														);

													return question.responseType !==
														undefined
														? responseTypeMap[
																question
																	.responseType
														  ]({
																name: "answer",
																checkValue:
																	selection?.selectionIdx,
																value: isChecked,
																onChange: (e) =>
																	onChangeResponse(
																		e,
																		{
																			questionIdx:
																				question.questionIdx!,
																			responseIdx:
																				matchedResponse?.responseIdx,
																			responseTempId: `resp-${selection?.selectionIdx}`,
																			answer: String(
																				selection?.selectionIdx
																			),
																		}
																	),
																isResponse:
																	true,
																selection:
																	selection?.selection,
														  })
														: null;
												}
										  )
										: // selections 없이도 렌더링되는 경우 (text형)
										  responseTypeMap[
												question.responseType
										  ]({
												name: "answer",
												value:
													question?.responses?.[0]
														?.answer || "",
												onChange: (e) =>
													onChangeResponse(e, {
														questionIdx:
															question.questionIdx!,
														responseIdx:
															question
																?.responses?.[0]
																?.responseIdx,
														responseTempId: `resp-${question.questionIdx}`,
														answer: String(
															question
																?.responses?.[0]
																?.answer
														),
													}),
												width: "50vw",
												isResponse: true,
										  }))}
							</div>
						</div>
					))}
			</div>
			<Divider type="none"></Divider>

			<CommonButtonGroup
				usedButtons={{
					btnSubmit: true,
					btnList: true,
				}}
				onSubmit={onSubmitResponse}
			></CommonButtonGroup>
		</div>
	);
}
