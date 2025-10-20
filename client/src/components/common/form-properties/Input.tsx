"use client";

import styles from "./styles/Input.module.scss";

/******************************
 * Component Name: Input
 * Type: boxed, underlined
 ******************************/

interface InputComponentProps {
	type?: string;
	name: string;
	label?: string;
	value: any;
	width?: string;
	onChange?: any;
	componentType: "boxed" | "underlined" | "smallUnderlined";
	readOnly?: boolean;
	placeholder?: string;
	onKeyDown?: any;
	allowNegative?: boolean;
	step?: string | number;
}

const Input = ({
	type,
	name,
	label,
	width,
	value,
	onChange,
	componentType,
	readOnly = false,
	placeholder,
	onKeyDown,
	allowNegative = false,
	step,
}: InputComponentProps) => {
	// 음수 입력 방지
	function preventNegative(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "-" || e.key === "e") {
			e.preventDefault();
		}
		onKeyDown?.(e);
	}

	return (
		<div className={styles.inputContainer} style={{width: width}}>
			<input
				type={type ?? "text"}
				name={name}
				value={value}
				onChange={onChange}
				className={styles[componentType]}
				readOnly={readOnly}
				placeholder={placeholder ?? " "}
				onKeyDown={allowNegative ? onKeyDown : preventNegative}
				min={allowNegative ? undefined : 0}
				step={step}
			/>
			<label className={styles["input-label"]}>{label}</label>
		</div>
	);
};

export default Input;
