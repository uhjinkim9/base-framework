"use client";
import styles from "./styles/InputTextArea.module.scss";
import {ChangeEvent} from "react";

type Props = {
	componentType?: "grayBorder" | "noBorder";
	name: string;
	value: any;
	onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
	width?: string;
	height?: string;
	readOnly?: boolean;
	placeholder?: string;
	label?: string;
};

export default function InputTextArea(props: Props) {
	return (
		<div className={styles.container}>
			{props.label && (
				<label className={styles.label}>{props.label}</label>
			)}
			<textarea
				className={`${styles.textarea} ${
					styles[props.componentType ?? "grayBorder"]
				}`}
				name={props.name}
				value={props.value}
				onChange={props.onChange}
				placeholder={props.placeholder}
				readOnly={props.readOnly}
				style={{
					width: props.width,
					height: props.height,
				}}
			/>
		</div>
	);
}
