"use client";

import React, {ChangeEvent} from "react";
import styles from "./styles/ScorePicker.module.scss";

type Props = {
	name: string;
	value: number;
	checked: boolean;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
	active?: boolean;
	readOnly?: boolean;
};

const ScorePicker = ({name, value, onChange, readOnly}: Props) => {
	const ScoreCircle = ({
		name,
		value,
		checked,
		onChange,
		active = false,
		readOnly = false,
	}: Props) => (
		<label className={`${styles.radio} ${active ? styles.active : ""}`}>
			<input
				type="radio"
				name={name}
				value={value}
				checked={checked}
				onChange={readOnly ? undefined : onChange}
				disabled={readOnly}
			/>
			<span className={styles.dot}></span>
			<span className={styles.label}>{value}</span>
		</label>
	);

	const dotGap = 60; // px
	const dotSize = 12; // px

	return (
		<div
			className={styles.wrapper}
			style={
				{
					// value 1~10 → 1~10%
					// CSS 변수: --score: 0.1 ~ 1
					"--score-ratio": `${((value - 1) / 9) * 100}%`,
				} as React.CSSProperties
			}
		>
			{Array.from({length: 10}, (_, i) => i + 1).map((val) => (
				<ScoreCircle
					key={val}
					name={name}
					value={val}
					checked={value === val}
					active={value >= val} // 여기서 active 여부 결정
					onChange={(e) => {
						if (readOnly) {
							return;
						}
						const fakeEvent = {
							...e,
							target: {
								...e.target,
								name: name,
								value: e.target.value.toString(),
							},
						} as ChangeEvent<HTMLInputElement>;
						onChange?.(fakeEvent);
					}}
				/>
			))}
		</div>
	);
};

export default ScorePicker;
