"use client";
import styles from "../styles/PlanModal.module.scss";
import clsx from "clsx";
import {AnimatePresence, motion} from "framer-motion";

import {usePlanContext} from "@/context/PlanContext";
import {convertDayNumberToChar} from "@/components/src/plan/etc/calendar-helper";
import {
	CalendarSelectOptionType,
	period,
	RepeatTypes,
	RepeatEndTypes,
	TaskType,
} from "@/types/plan.type";

import DateTimeRangePicker from "@/components/common/form-properties/DateTimeRangePicker";
import SelectBox from "@/components/common/form-properties/SelectBox";
import Toggle from "@/components/common/form-properties/Toggle";
import InputBasic from "@/components/common/form-properties/InputBasic";
import Radio from "@/components/common/form-properties/Radio";
import {
	RepeatCountNode,
	RepeatEndTypeSelect,
	RepeatIntervalInput,
	RepeatUntilNode,
} from "../RepeatNodes";

export default function AddNewTask({
	calendarGroup,
	onChangeNewPlan,
	onChangeRepeatRule,
	whichDayinTheMonth,
}: {
	calendarGroup: CalendarSelectOptionType[];
	onChangeNewPlan: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => void;
	onChangeRepeatRule: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => void;
	whichDayinTheMonth: {label: string; value: any}[];
}) {
	const {planState, taskState, repeatRuleState, taskDispatch} =
		usePlanContext();
	const {plan} = planState;
	const {task} = taskState;
	const {repeatRule} = repeatRuleState;

	// Task 상세 필드 변경 핸들러
	function onChangeTask(
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) {
		const {name, value} = e.target;
		taskDispatch({
			type: "UPDATE_TASK_FIELD",
			payload: {name: name as keyof TaskType, value},
		});
	}

	// 반복 주기 값
	const repeatFrequency = repeatRule?.freq;

	return (
		<div className={styles.wrapper}>
			<div className={styles.row}>
				<InputBasic
					label="제목"
					onChange={onChangeNewPlan}
					value={plan?.title}
					name="title"
				/>
				<SelectBox
					componentType="smallGray"
					name="menuIdx"
					value={plan?.menuIdx}
					defaultLabel="일정 그룹"
					width="8rem"
					customOptions={calendarGroup}
					onChange={onChangeNewPlan}
				/>
			</div>

			<div className={styles.row}>
				<span className={styles.label}>날짜</span>
				<DateTimeRangePicker
					startedAt={plan.startedAt || ""}
					endedAt={plan.endedAt || ""}
					onChange={onChangeNewPlan}
					isDateOnly={plan?.isAllday}
					isStartDayOnly={true}
				></DateTimeRangePicker>
			</div>

			<div className={clsx(styles.row, styles.gap2rem)}>
				<div className={clsx(styles.row)}>
					<span className={styles.label}>종일</span>
					<Toggle
						name="isAllday"
						value={plan?.isAllday}
						onChange={onChangeNewPlan}
					/>
				</div>
				{/* <div className={clsx(styles.row)}>
					<span className={styles.label}>반복</span>
					<Toggle
						name="isRepeated"
						value={plan.isRepeated}
						onChange={onChangeNewPlan}
					/>
				</div> */}
			</div>

			<div className={styles.selectRepeatPeriod}>
				<AnimatePresence>
					{plan?.isRepeated && (
						<motion.div
							initial={{height: 0, opacity: 0}}
							animate={{height: "auto", opacity: 1}}
							exit={{height: 0, opacity: 0}}
							transition={{duration: 0.5, ease: "easeInOut"}}
							className={styles.selectRepeatPeriod}
						>
							<div className={styles.row}>
								<Radio
									name="freq"
									checkValue={RepeatTypes.DAILY}
									value={
										repeatFrequency === RepeatTypes.DAILY
									}
									onChange={onChangeRepeatRule}
								>
									일 반복
								</Radio>

								{repeatFrequency === RepeatTypes.DAILY && (
									<div className={styles.repeatDetail}>
										<RepeatIntervalInput
											value={repeatRule?.interval}
											onChange={onChangeRepeatRule}
										/>
										<span>일마다</span>
										<RepeatEndTypeSelect
											value={repeatRule?.repeatEndType}
											onChange={onChangeRepeatRule}
											options={period}
										/>

										{repeatRule?.repeatEndType ===
											RepeatEndTypes.COUNT && (
											<RepeatCountNode
												value={repeatRule.count}
												onChange={onChangeRepeatRule}
											/>
										)}
										{repeatRule?.repeatEndType ===
											RepeatEndTypes.UNTIL && (
											<RepeatUntilNode
												value={repeatRule.until}
												onChange={onChangeRepeatRule}
											/>
										)}
										<span>반복</span>
									</div>
								)}
							</div>

							<div className={styles.row}>
								<Radio
									name="freq"
									checkValue={RepeatTypes.WEEKLY}
									value={
										repeatFrequency === RepeatTypes.WEEKLY
									}
									onChange={onChangeRepeatRule}
								>
									주 반복
								</Radio>

								{repeatFrequency === RepeatTypes.WEEKLY && (
									<div className={styles.repeatDetail}>
										<RepeatIntervalInput
											value={repeatRule?.interval}
											onChange={onChangeRepeatRule}
										/>
										<span>주 주기로 </span>
										<span>
											{convertDayNumberToChar(
												Number(repeatRule?.byweekday),
												"kor"
											)}
											요일마다
										</span>
										<RepeatEndTypeSelect
											value={repeatRule?.repeatEndType}
											onChange={onChangeRepeatRule}
											options={period}
										/>

										{repeatRule?.repeatEndType ===
											RepeatEndTypes.COUNT && (
											<RepeatCountNode
												value={repeatRule.count}
												onChange={onChangeRepeatRule}
											/>
										)}
										{repeatRule?.repeatEndType ===
											RepeatEndTypes.UNTIL && (
											<RepeatUntilNode
												value={repeatRule.until}
												onChange={onChangeRepeatRule}
											/>
										)}
									</div>
								)}
							</div>

							<div className={styles.row}>
								<Radio
									name="freq"
									checkValue={RepeatTypes.MONTHLY}
									value={
										repeatFrequency === RepeatTypes.MONTHLY
									}
									onChange={onChangeRepeatRule}
								>
									월 반복
								</Radio>

								{repeatFrequency === RepeatTypes.MONTHLY && (
									<div className={styles.repeatDetail}>
										<RepeatIntervalInput
											value={repeatRule?.interval}
											onChange={onChangeRepeatRule}
										/>

										<span>개월 주기로 </span>
										<SelectBox
											name="bymonthday"
											value={repeatRule?.bymonthday}
											componentType="smallGray"
											customOptions={whichDayinTheMonth}
											onChange={onChangeRepeatRule}
										></SelectBox>
										<span>마다</span>

										<RepeatEndTypeSelect
											value={repeatRule?.repeatEndType}
											onChange={onChangeRepeatRule}
											options={period}
										/>
										{repeatRule?.repeatEndType ===
											RepeatEndTypes.COUNT && (
											<RepeatCountNode
												value={repeatRule.count}
												onChange={onChangeRepeatRule}
											/>
										)}
										{repeatRule?.repeatEndType ===
											RepeatEndTypes.UNTIL && (
											<RepeatUntilNode
												value={repeatRule.until}
												onChange={onChangeRepeatRule}
											/>
										)}
									</div>
								)}
							</div>

							<div className={styles.row}>
								<Radio
									name="freq"
									checkValue={RepeatTypes.YEARLY}
									value={
										repeatFrequency === RepeatTypes.YEARLY
									}
									onChange={onChangeRepeatRule}
								>
									연 반복
								</Radio>
								{repeatFrequency === RepeatTypes.YEARLY && (
									<div className={styles.repeatDetail}>
										<RepeatIntervalInput
											value={repeatRule?.interval}
											onChange={onChangeRepeatRule}
										/>

										<span>
											년 주기로{" "}
											{plan.startedAt
												? plan.startedAt
														.split("T")[0]
														.split("-")[1] || " - "
												: ""}
											월{" "}
											{plan.startedAt
												? plan.startedAt
														.split("T")[0]
														.split("-")[2] || " - "
												: ""}
											일마다
										</span>
										<RepeatEndTypeSelect
											value={repeatRule?.repeatEndType}
											onChange={onChangeRepeatRule}
											options={period}
										/>

										{repeatRule?.repeatEndType ===
											RepeatEndTypes.COUNT && (
											<RepeatCountNode
												value={repeatRule.count}
												onChange={onChangeRepeatRule}
											/>
										)}
										{repeatRule?.repeatEndType ===
											RepeatEndTypes.UNTIL && (
											<RepeatUntilNode
												value={repeatRule.until}
												onChange={onChangeRepeatRule}
											/>
										)}
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<InputBasic
				label="메모"
				onChange={onChangeTask}
				value={task?.memo || ""}
				name="memo"
			></InputBasic>
		</div>
	);
}
