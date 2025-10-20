/**
 * @fileoverview DropModal 컴포넌트
 * @description 사용자 입력을 받는 드롭다운 미니 모달 컴포넌트로, 활성화 여부에 따라 텍스트와 입력 필드를 표시
 *
 * @interface Props
 * @property {ReactNode} children - 모달 안에 렌더링할 자식 요소
 * @property {boolean} isActive - 모달 활성화 여부
 * @property {string} [text] - 모달에 표시할 텍스트 (선택 사항)
 * @property {(e: React.ChangeEvent<HTMLInputElement>) => void} [onChangeInput] - 입력 값 변경 시 호출되는 이벤트 핸들러 (선택 사항)
 * @property {string} [name] - 입력 필드의 name 속성 (선택 사항)
 * @property {any} [value] - 입력 필드의 값 (선택 사항)
 *
 * @function DropModal - 주어진 `isActive` 상태에 따라 모달을 표시하며, `onChangeInput` 이벤트 핸들러를 통해 입력 값 처리
 *
 * @effect
 * - `isActive`가 true일 경우 모달이 표시되고, 입력 필드와 텍스트가 활성화됨
 *
 * @dependencies
 * - styles: SCSS 모듈을 통한 스타일링
 *
 * @example
 * <DropModal isActive={true} onChangeInput={handleInputChange} value={inputValue}>
 *   <div>Content</div>
 * </DropModal>
 *
 * @author 김어진
 * @created 2025-04-15
 * @version 1.0.0
 */

"use client";
import styles from "./styles/DropModal.module.scss";
import {ReactNode} from "react";

type Props = {
	children: ReactNode;
	isActive: boolean;
	content?: ReactNode;
	onChangeInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	name?: string;
	value?: any;
};

export default function DropModal({children, isActive, content}: Props) {
	return (
		<div className={styles.tooltipWrapper}>
			{children}
			<div
				className={`${styles.tooltipText} ${
					isActive ? styles.isActive : ""
				}`}
			>
				{content}
			</div>
		</div>
	);
}
