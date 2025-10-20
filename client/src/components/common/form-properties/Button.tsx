/**
 * @fileoverview Button 컴포넌트
 * @description 다양한 스타일 및 hover 효과를 지원하는 범용 커스텀 버튼 컴포넌트
 *
 * @interface ButtonComponentProps
 * @property {string} [name] - 버튼의 name 속성 (선택 사항)
 * @property {() => void} [onClick] - 버튼 클릭 이벤트 핸들러 (선택 사항)
 * @property {() => void} [onMouseEnter] - 마우스 오버 이벤트 핸들러 (선택 사항)
 * @property {"primaryFirst" | "primarySecond" | "secondary" | "text" | "transparent" | "smallGray" | "bigGray"} componentType - 버튼 스타일 타입
 * @property {React.ReactNode} children - 버튼 내부 콘텐츠
 * @property {boolean} [onHoverOpaque] - hover 시 투명도 효과 적용 여부 (선택 사항)
 *
 * @author 김어진
 * @created 2025-03-14
 * @version 1.0.0
 */

"use client";
import styles from "./styles/Button.module.scss";

interface ButtonComponentProps {
	name?: string;
	onClick?: any;
	onMouseEnter?: any | null;
	componentType:
		| "primaryFirst"
		| "bigPrimaryFirst"
		| "primarySecond"
		| "secondary"
		| "text"
		| "transparent"
		| "smallGray"
		| "bigGray";
	children?: any;
	onHoverOpaque?: boolean;
	width?: string;
}

const Button = ({
	name,
	onClick,
	onMouseEnter,
	componentType,
	children,
	onHoverOpaque,
	width,
}: ButtonComponentProps) => {
	return (
		<button
			name={name}
			className={`${styles[componentType]} ${
				onHoverOpaque ? styles.onHoverOpaque : ""
			}`}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			style={{width: width}}
		>
			{children}
		</button>
	);
};

export default Button;
