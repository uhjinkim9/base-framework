"use client";
import styles from "./styles/AddPoll.module.scss"; // 공통 스타일만 사용
import {ChangeEvent} from "react";
import {ResponseTypeEnum} from "@/types/poll.type";

import DateTimeRangePicker from "@/components/common/form-properties/DateTimeRangePicker";
import InputTextArea from "@/components/common/form-properties/InputTextArea";
import CheckBox from "@/components/common/form-properties/CheckBox";
import Input from "@/components/common/form-properties/Input";
import Radio from "@/components/common/form-properties/Radio";
import ScorePicker from "@/components/common/form-properties/ScorePicker";
import clsx from "clsx";

type Props = {
	name: string;
	value: any;
	checked?: boolean;
	onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	isResponse?: boolean;
	checkValue?: string | number; // 응답
	componentType?: any;
	height?: string;
	width?: string;
	startedAt?: string;
	isDateOnly?: boolean;
	isStartDayOnly?: boolean;
	selection?: string;
	responses?: ResponseType[];
};

// poll-response-type === 'check'
export const CheckTypeNode = ({
	name,
	value,
	checkValue,
	onChange,
	isResponse = false,
	selection,
}: Props) => (
	<div className={clsx(styles.row, styles.inRowGroup)}>
		{isResponse ? (
			<>
				{/* 응답 페이지 */}
				<CheckBox
					componentType="orange"
					name={name}
					value={value}
					checkValue={checkValue} // 해당 체크박스가 true일 경우 가질 값
					onChange={onChange}
				></CheckBox>
				<span className="subText">{selection}</span>
			</>
		) : (
			<>
				{/* 등록 페이지 */}
				<CheckBox componentType="orange"></CheckBox>
				<Input
					name={name}
					value={value}
					componentType="smallUnderlined"
					onChange={onChange}
					width="100%"
				></Input>
			</>
		)}
	</div>
);

// poll-response-type === 'radio'
export const RadioTypeNode = ({
	name,
	value,
	checkValue,
	onChange,
	isResponse = false,
	selection,
}: Props) => (
	<div className={clsx(styles.row, styles.inRowGroup)}>
		{isResponse ? (
			<>
				{/* 응답 페이지 */}
				<Radio
					componentType="orange"
					name={name}
					value={value}
					checkValue={checkValue} // 해당 체크박스가 true일 경우 가질 값
					onChange={onChange}
				></Radio>
				<span className="subText">{selection}</span>
			</>
		) : (
			<>
				{/* 등록 페이지 */}
				<Radio componentType="orange"></Radio>
				<Input
					name={name}
					value={value}
					componentType="smallUnderlined"
					onChange={onChange}
					width="100%"
				></Input>
			</>
		)}
	</div>
);

// poll-response-type === 'short-text' || 'long-text'
export const TextTypeNode = ({
	name,
	value,
	onChange,
	componentType,
	width,
	height,
	isResponse = false,
}: Props) => (
	<div className={clsx(styles.row, styles.inRowGroup)}>
		<InputTextArea
			componentType={componentType}
			name={name}
			value={value}
			placeholder={isResponse ? "응답" : ""}
			onChange={isResponse ? onChange : undefined}
			readOnly={!isResponse}
			width={width}
			height={height}
		></InputTextArea>
	</div>
);

// poll-response-type === 'number'
export const NumberTypeNode = ({
	name,
	value,
	onChange,
	componentType,
	width,
	isResponse = false,
}: Props) => (
	<div className={clsx(styles.row, styles.inRowGroup)}>
		<Input
			type="number"
			name={name}
			value={value}
			onChange={isResponse ? onChange : undefined}
			componentType={componentType}
			width={width}
			readOnly={!isResponse}
		></Input>
	</div>
);

// poll-response-type === 'date'
export const DateTypeNode = ({
	startedAt,
	onChange,
	isDateOnly,
	isStartDayOnly,
	isResponse = false,
}: Props) => (
	<DateTimeRangePicker
		startedAt={startedAt}
		onChange={isResponse ? onChange : undefined}
		isDateOnly={isDateOnly}
		isStartDayOnly={isStartDayOnly}
		readOnly={!isResponse}
	></DateTimeRangePicker>
);

// poll-response-type === 'score'
export const ScoreTypeNode = ({
	name,
	value,
	checked,
	onChange,
	isResponse = false,
}: Props) => (
	<ScorePicker
		name={name}
		value={Number(value)}
		checked={checked ?? false}
		onChange={isResponse ? onChange : undefined}
		readOnly={!isResponse}
	></ScorePicker>
);

export const responseTypeMap: Record<
	ResponseTypeEnum,
	(Props: Props) => React.ReactNode
> = {
	[ResponseTypeEnum.CHECK]: (Props) => <CheckTypeNode {...Props} />,
	[ResponseTypeEnum.RADIO]: (Props) => <RadioTypeNode {...Props} />,
	[ResponseTypeEnum.SHORT_TEXT]: (Props) => (
		<TextTypeNode {...Props} height="1.5rem" componentType="grayBorder" />
	),
	[ResponseTypeEnum.LONG_TEXT]: (Props) => (
		<TextTypeNode {...Props} height="3rem" componentType="grayBorder" />
	),
	[ResponseTypeEnum.NUMBER]: (Props) => (
		<NumberTypeNode
			{...Props}
			width="20%"
			componentType="smallUnderlined"
		/>
	),
	[ResponseTypeEnum.DATE]: (Props) => (
		<DateTypeNode {...Props} isDateOnly={true} isStartDayOnly={true} />
	),
	[ResponseTypeEnum.SCORE]: (Props) => <ScoreTypeNode {...Props} />,
};
