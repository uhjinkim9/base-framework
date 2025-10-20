"use client";
import styles from "./styles/CheckBox.module.scss";
import {IoIosCheckmark} from "react-icons/io";

type Props = {
	name?: string;
	value?: boolean; // 기존 checked 역할
	checkValue?: any; // checkBox를 선택하면 가질 값
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	componentType?: "orange" | "gray" | "mark";
	children?: React.ReactNode;
	readOnly?: boolean;
};

const CheckBox = ({
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
					type: "checkbox",
				},
			};
			onChange(
				fakeEvent as unknown as React.ChangeEvent<HTMLInputElement>
			);
		}
	};

	return (
		<label className={`${styles.checkbox} ${styles[componentType]}`}>
			<input
				type="checkbox"
				name={name}
				checked={value}
				value={checkValue}
				onChange={handleChange}
				className={styles.input}
				disabled={readOnly}
			/>
			<span className={styles.normalCheckmark}>
				<IoIosCheckmark className={styles.icon} />
			</span>
			{children && <span className={styles.label}>{children}</span>}
		</label>
	);
};

export default CheckBox;
