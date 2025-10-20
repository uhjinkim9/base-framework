"use client";
import {isNotEmpty} from "@/util/validators/check-empty";
import styles from "./styles/InputBasic.module.scss";

import clsx from "clsx";

type Props = {
	type?: string;
	name: string;
	label?: string;
	value?: any;
	width?: string;
	onChange?: any;
	componentType?: "basic";
	readOnly?: boolean;
	placeholder?: string;
	onKeyDown?: any;
	onBlur?: any;
	autoFocus?: boolean;
	allowNegative?: boolean;
	step?: string | number;
	noPadding?: boolean;
};

/**
 * @description 효과 없이 입력의 기능만 갖춘 입력 컴포넌트
 */
const InputBasic = ({
	type = "text",
	name,
	label,
	width,
	value,
	onChange,
	componentType = "basic",
	readOnly = false,
	placeholder,
	onKeyDown,
	onBlur,
	autoFocus = false,
	allowNegative = true,
	step,
	noPadding = false,
}: Props) => {
	// 음수 입력 방지
	function preventNegative(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "-" || e.key === "e") {
			e.preventDefault();
		}
		onKeyDown?.(e);
	}

	return (
		<div
			className={clsx(
				styles.container,
				noPadding ? styles.noPadding : ""
			)}
			style={{width: width}}
		>
			{isNotEmpty(label) && (
				<label className={clsx(styles[componentType], styles.label)}>
					{label}
				</label>
			)}
			<input
				type={type}
				name={name}
				value={value ?? ""}
				onChange={onChange}
				className={clsx(
					styles[componentType],
					styles.input,
					readOnly ? styles.readOnly : ""
				)}
				readOnly={readOnly}
				placeholder={placeholder ?? " "}
				onKeyDown={allowNegative ? onKeyDown : preventNegative}
				onBlur={onBlur}
				autoFocus={autoFocus}
				min={allowNegative ? undefined : 0}
				step={step}
				style={{width: width}}
			/>
		</div>
	);
};

export default InputBasic;
