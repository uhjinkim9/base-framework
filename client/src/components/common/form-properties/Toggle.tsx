"use client";
import styles from "./styles/Toggle.module.scss";
import {FakeChangeEventType} from "@/types/common.type";

interface ToggleProps {
	label?: string;
	name?: string;
	value?: boolean; // 기존 checked 역할
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	readOnly?: boolean;
}

export default function Toggle({
	label,
	name,
	value = false,
	onChange,
	readOnly = false,
}: ToggleProps) {
	const handleChange = () => {
		if (!onChange || readOnly) return;

		const fakeEvent: FakeChangeEventType = {
			target: {
				name: name || "",
				value: !value, // boolean 값
				type: "toggle",
			},
		} as unknown as FakeChangeEventType;
		onChange(fakeEvent as unknown as React.ChangeEvent<HTMLInputElement>);
	};

	return (
		<div className={styles.wrapper}>
			{label && <span className={styles.label}>{label}</span>}
			<label
				className={`${styles.toggleContainer} ${
					value === true ? styles.toggled : ""
				}`}
			>
				<input
					type="checkbox"
					name={name}
					checked={value}
					onChange={handleChange}
					className={styles.input}
					readOnly={readOnly}
				/>
				<span className={styles.toggleSwitch} />
			</label>
		</div>
	);
}
