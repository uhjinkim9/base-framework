"use client";
import styles from "./styles/AddPost.module.scss";
import clsx from "clsx";

import {motion} from "framer-motion";
import {ChangeEvent} from "react";
import {useBoardContext} from "@/context/BoardContext";

import SubTitle from "@/components/common/segment/SubTitle";
import SelectBox from "@/components/common/form-properties/SelectBox";
import Toggle from "@/components/common/form-properties/Toggle";
import Input from "@/components/common/form-properties/Input";
import DateRangePicker from "@/components/common/form-properties/DateRangePicker";
import DateTimePicker from "@/components/common/form-properties/DateTimePicker";

type Props = {
	onChangePost?: (
		e: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => void;
};

export default function PostSetting({onChangePost}: Props) {
	const {postState, boardMenus} = useBoardContext();
	const {mode, post} = postState;
	const boards = [...boardMenus.cpBoards, ...boardMenus.psBoards];

	const selectableBoards = boards
		.filter((b) => !b.menuId.includes("all") && !b.menuId.includes("mine"))
		.map((b) => ({label: b.menuNm, value: b.menuId}));

	// 게시물 등록/수정 화면에서
	const addNode = (
		<>
			<div className={styles.row}>
				<Input
					componentType="underlined"
					name="title"
					value={post?.title ?? ""}
					onChange={onChangePost}
					label="제목"
				/>
			</div>
			<div className={clsx(styles.row, styles.settings)}>
				<div className="inRowGroup">
					<SelectBox
						onChange={onChangePost}
						componentType="smallGray"
						customOptions={selectableBoards}
						name="menuId"
						value={post?.menuId}
					/>
					{/* 말머리 사용 O라면 말머리 선택하는 셀렉박스 넣기 */}
				</div>
				<div className={(clsx("inRowGroup"), styles.toggles)}>
					<Toggle
						label="상단 고정"
						name="isNotice"
						value={post?.isNotice}
						onChange={onChangePost}
					/>
					<Toggle
						label="예약"
						name="isScheduled"
						value={post?.isScheduled}
						onChange={onChangePost}
					/>
				</div>
			</div>
			<motion.div
				className={clsx(styles.row, styles.datePicker)}
				initial={false}
				animate={{
					height: post?.isNotice ? "auto" : 0,
					opacity: post?.isNotice ? 1 : 0,
				}}
				transition={{
					duration: 0.3,
					ease: "easeInOut",
				}}
				style={{overflow: "hidden"}}
			>
				<span className={styles.refText}>상단 고정 기간</span>
				<DateRangePicker
					startedAt={post?.noticeStartedAt}
					endedAt={post?.noticeEndedAt}
					startName="noticeStartedAt"
					endName="noticeEndedAt"
					onChange={onChangePost}
				/>
			</motion.div>
			<motion.div
				className={clsx(styles.row, styles.datePicker)}
				initial={false}
				animate={{
					height: post?.isScheduled ? "auto" : 0,
					opacity: post?.isScheduled ? 1 : 0,
				}}
				transition={{
					duration: 0.3,
					ease: "easeInOut",
				}}
				style={{overflow: "hidden"}}
			>
				<span className={styles.refText}>업로드 예약일</span>
				<DateTimePicker
					initDate={post?.scheduledAt}
					initDateNm="scheduledAt"
					onChange={onChangePost}
				/>
			</motion.div>
		</>
	);

	// 게시물 안내/응답/결과 화면에서
	const showNode = (
		<>
			결과
			<SubTitle underlined={false}>{post?.title}</SubTitle>
			<div
				className={clsx(
					styles.row, // 글로벌 클래스
					styles.settings
				)}
			>
				<div className={styles.inRowGroup}>
					<SelectBox
						onChange={onChangePost}
						componentType="smallGray"
						customOptions={[
							{label: "뿡", value: "bbung"},
							{label: "잉", value: "ing"},
						]}
						name="menuId"
						value={undefined}
					/>
					{/* 말머리 사용 O라면 말머리 선택하는 거 있기 */}
				</div>

				<div className={styles.toggles}>
					<Toggle
						label="게시물 상단 고정"
						name="isNotice"
						value={post?.isNotice}
						onChange={onChangePost}
					/>
					<Toggle
						label="예약 등록"
						name="isScheduled"
						value={post?.isScheduled}
						onChange={onChangePost}
					/>
				</div>
			</div>
		</>
	);

	return <>{mode === "add" || mode === "edit" ? addNode : showNode}</>;
}
