"use client";
import styles from "./styles/ButtonBasic.module.scss";

import clsx from "clsx";

type Props = {
	name?: string;
	onClick?: any;
	componentType?: "basic" | "grayBorder";
	onHoverOpaque?: boolean;
	width?: string;
	disabled?: boolean;
	children: any; //' 라벨 역할
};

/**
 * @description 효과 없이 입력의 기능만 갖춘 입력 컴포넌트
 */
const ButtonBasic = ({
	name,
	onClick,
	componentType = "basic",
	onHoverOpaque,
	width,
	disabled = false,
	children,
}: Props) => {
	return (
		<button
			name={name}
			className={`${clsx(styles[componentType], styles.button)} ${
				onHoverOpaque ? styles.onHoverOpaque : ""
			}`}
			onClick={onClick}
			style={{width: width}}
			disabled={disabled}
		>
			{children}
		</button>
	);
};

export default ButtonBasic;
