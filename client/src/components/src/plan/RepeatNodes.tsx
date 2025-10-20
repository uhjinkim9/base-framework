"use client";
import styles from "./styles/PlanModal.module.scss";

import Input from "@/components/common/form-properties/Input";
import SelectBox from "@/components/common/form-properties/SelectBox";

import {convertDayNumberToChar} from "@/components/src/plan/etc/calendar-helper";
import {usePlanContext} from "@/context/PlanContext";

import {BiRepeat} from "react-icons/bi";
import clsx from "clsx";

type InputProps = {
	value: any;
	onChange: (e: React.ChangeEvent<any>) => void;
};

type InputSelectProps = InputProps & {
	options: {value: string; label: string}[];
};

export function RepeatCountNode({value, onChange}: InputProps) {
	return (
		<>
			<Input
				type="number"
				componentType="smallUnderlined"
				name="count"
				value={value}
				onChange={onChange}
				width="40px"
			/>
			<span>회</span>
		</>
	);
}

export function RepeatUntilNode({value, onChange}: InputProps) {
	return (
		<>
			<Input
				type="date"
				componentType="smallUnderlined"
				name="until"
				value={value || ""}
				onChange={onChange}
				width="120px"
			/>
			<span>까지</span>
		</>
	);
}

export function RepeatEndTypeSelect({
	value,
	onChange,
	options,
}: InputSelectProps) {
	return (
		<SelectBox
			componentType="smallGray"
			customOptions={options}
			name="repeatEndType"
			value={value}
			onChange={onChange}
		/>
	);
}

export function RepeatIntervalInput({value, onChange}: InputProps) {
	return (
		<Input
			type="number"
			componentType="smallUnderlined"
			name="interval"
			value={value}
			onChange={onChange}
			width="40px"
		/>
	);
}

const repeatTypeMap = {
	DAILY: "일마다",
	WEEKLY: "주 주기로",
	MONTHLY: "개월 주기로",
	YEARLY: "년마다",
};

export function RepeatInfo() {
	const {planState} = usePlanContext();
	const {plan} = planState;

	const repeatRule = plan?.repeatRule;

	return (
		<>
			{plan?.isRepeated && (
				<div className={clsx(styles.row, styles.icon)}>
					<BiRepeat />
				</div>
			)}

			<div className={styles.row}>
				{plan?.isRepeated && (
					<>
						<span>{repeatRule?.interval}</span>
						<span>
							{
								repeatTypeMap[
									repeatRule?.freq as keyof typeof repeatTypeMap
								]
							}
						</span>
					</>
				)}
			</div>

			{repeatRule?.freq === "WEEKLY" && (
				<div className={styles.row}>
					{(() => {
						const byweekday = Number(repeatRule?.byweekday);

						if (byweekday) {
							return convertDayNumberToChar(byweekday, "kor");
						}
						return null;
					})()}
					요일마다
				</div>
			)}

			<div className={styles.row}>
				{(() => {
					const repeatEndType = repeatRule?.repeatEndType;
					if (repeatEndType === "never") {
						return <span>계속</span>;
					} else if (repeatEndType === "count") {
						return <span>{repeatRule?.count}회 반복</span>;
					} else if (repeatEndType === "until") {
						return <span>{repeatRule?.until}까지 반복</span>;
					}
					return null;
				})()}
			</div>
		</>
	);
}
