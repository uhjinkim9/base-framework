"use client";
import styles from "./styles/Radio.module.scss";
import React from "react";

type Props = {
	name?: string;
	value?: boolean; // 기존 checked 역할
	checkValue?: string | number; // 선택하면 가질 값
	onChange?: (e: any) => void;
	componentType?: "orange" | "gray";
	children?: React.ReactNode;
	readOnly?: boolean;
};

const Radio = ({
	name,
	value,
	checkValue,
	onChange,
	componentType = "orange",
	children,
	readOnly = false,
}: Props) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (onChange) {
			const fakeEvent = {
				...e,
				target: {
					...e.target,
					name: name ?? "",
					checkValue: checkValue,
					value: e.target.checked,
					checked: e.target.checked,
					type: "radio" as const,
				},
			};
			onChange(
				fakeEvent as unknown as React.ChangeEvent<HTMLInputElement>
			);
		}
	};

	return (
		<label className={`${styles.radio} ${styles[componentType]}`}>
			<input
				type="radio"
				name={name}
				checked={value}
				value={checkValue}
				onChange={handleChange}
				className={styles.input}
				disabled={readOnly}
			/>
			<span className={styles.checkmark}></span>
			{children && <span className={styles.label}>{children}</span>}
		</label>
	);
};

export default Radio;
