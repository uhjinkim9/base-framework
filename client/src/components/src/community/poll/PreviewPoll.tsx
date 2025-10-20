"use client";
import styles from "./styles/AddPoll.module.scss";
import {useRef} from "react";

import SubTitle from "@/components/common/segment/SubTitle";
import Divider from "@/components/common/segment/Divider";

import {responseTypeMap} from "./QuestionNodes";
import {PollType} from "@/components/src/poll/etc/poll.type";

export default function PreviewPoll({poll}: {poll: PollType}) {
	const randomIdRef = useRef<number>(0);

	return (
		<div>
			<SubTitle underlined={false}>{poll?.title}</SubTitle>
			<Divider type="none" />

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
													return question.responseType !==
														undefined
														? responseTypeMap[
																question
																	.responseType
														  ]({
																name: "answer",
																checkValue:
																	selection?.selectionIdx,
																value: false,
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
												width: "50vw",
												isResponse: true,
										  }))}
							</div>
						</div>
					))}
			</div>
		</div>
	);
}
