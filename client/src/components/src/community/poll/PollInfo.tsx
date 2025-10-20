"use client";
import styles from "./styles/PollInfo.module.scss";
import {useRouter} from "next/navigation";
import {ChangeEvent} from "react";
import {GoClock, GoPeople} from "react-icons/go";
import parse from "html-react-parser";
import clsx from "clsx";

import Toggle from "@/components/common/form-properties/Toggle";
import SubTitle from "@/components/common/segment/SubTitle";
import Divider from "@/components/common/segment/Divider";
import Button from "@/components/common/form-properties/Button";

import {usePollContext} from "@/context/PollContext";
import {RespondentType, ResponseStatus} from "@/types/poll.type";

import {LocalStorage} from "@/util/common/storage";
import {fullDateWithLabel} from "@/util/helpers/formatters";

type Props = {
	onChangePoll?: (
		e: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
		pollTempId: string
	) => void;
	pollTempId?: string;
};

export default function PollInfo({onChangePoll, pollTempId}: Props) {
	const router = useRouter();

	const {state} = usePollContext();
	const {mode, poll} = state;
	const {respondents} = poll || {};

	const startedAt = poll?.startedAt;
	const endedAt = poll?.endedAt;
	const formattedStart = fullDateWithLabel(startedAt ?? "");
	const formattedEnd = fullDateWithLabel(endedAt ?? "");

	const userId = LocalStorage.getUserId();
	const isRespondent = respondents?.some(
		(r: RespondentType) => r.userId === userId
	);
	const isAnonymous = poll?.isAnonymous;
	const isFinished = new Date(poll.endedAt || "") < new Date(); // 마감 여부

	// 응답자 통계 관련
	const respondentCompleted = respondents?.filter(
		(r: RespondentType) => r.responseStatus === ResponseStatus.COMPLETED
	);

	function goBackPage() {
		router.back();
	}

	// 설문 등록/수정 화면에서
	const addNode = <></>;

	// 설문 결과 화면에서
	const resultNode = (
		<>
			<SubTitle underlined={false}>{poll?.title}</SubTitle>
			<div
				className={clsx(
					styles.row, // 글로벌 클래스
					styles.pollSetting
				)}
			>
				<div className={styles.inRowGroup}>
					<GoClock />
					<span className={styles.date}>
						{formattedStart} ~ {formattedEnd}
					</span>
					<div className={styles.targets}>
						<GoPeople />
						<span className={styles.respondents}>
							{isAnonymous
								? poll?.completedRespondents
								: respondentCompleted?.length}
						</span>
						<span>
							/
							{isAnonymous
								? poll?.totalRespondents
								: respondents?.length}
						</span>
					</div>
				</div>

				<div className="inRowGroup">
					<div className={styles.inRowGroup}>
						<Toggle
							label="결과 공개"
							value={poll?.revealResult ?? false}
							readOnly
						/>
						<Toggle
							label="참여 후 수정 허용"
							value={poll?.modifyAfterAnswered ?? false}
							readOnly
						/>
						<Toggle
							label="익명 답변"
							value={poll?.isAnonymous ?? false}
							readOnly
						/>
					</div>
				</div>
			</div>
			<Divider type="hard" />
		</>
	);

	// 설문 안내/응답 화면에서
	const showNode = (
		<>
			<SubTitle underlined={false}>{poll?.title}</SubTitle>
			<div
				className={clsx(
					styles.row, // 글로벌 클래스
					styles.pollSetting
				)}
			>
				<div className={styles.inRowGroup}>
					<GoClock />
					<span className={styles.date}>
						{formattedStart} ~ {formattedEnd}
					</span>
					<div className={styles.targets}>
						<GoPeople />
						<span className={styles.respondents}>
							{isAnonymous
								? poll?.completedRespondents
								: respondentCompleted?.length}
						</span>
						<span>
							/
							{isAnonymous
								? poll?.totalRespondents
								: respondents?.length}
						</span>
					</div>
				</div>

				<div className={styles.inRowGroup}>
					<div className={styles.inRowGroup}>
						<Toggle
							label="결과 공개"
							value={poll?.revealResult ?? false}
							readOnly
						/>
						<Toggle
							label="참여 후 수정 허용"
							value={poll?.modifyAfterAnswered ?? false}
							readOnly
						/>
						<Toggle
							label="익명 답변"
							value={poll?.isAnonymous ?? false}
							readOnly
						/>
					</div>
				</div>
			</div>
			<Divider type="hard" />

			{isFinished ? (
				<div className={styles.finished}>
					<div className={styles.finishedWrapper}>
						<span>종료된 설문입니다.</span>
						<Button componentType="text" onClick={goBackPage}>
							이전 페이지로
						</Button>
					</div>
				</div>
			) : isRespondent ? (
				<div className={styles.pollExplanation}>
					{typeof poll?.explanation === "string"
						? parse(poll?.explanation)
						: null}
				</div>
			) : (
				<div className={styles.finished}>
					<div className={styles.finishedWrapper}>
						<span>설문 대상자가 아닙니다.</span>
						<Button componentType="text" onClick={goBackPage}>
							이전 페이지로
						</Button>
					</div>
				</div>
			)}
			<Divider type="hard" />
		</>
	);

	return (
		<>
			{mode === "add" || mode === "edit"
				? addNode
				: mode === "result"
				? resultNode
				: showNode}
		</>
	);
}
