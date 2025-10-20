/**
 * @fileoverview InputSearch 컴포넌트
 * @description 검색 아이콘이 포함된 입력 필드로, 헤더 또는 리스트 내 검색 영역에서 사용되는 컴포넌트
 *
 * @interface InputComponentProps
 * @property {string} [name] - input의 name 속성 (선택 사항)
 * @property {string} [value] - input의 현재 값 (선택 사항)
 * @property {string} [width] - input 너비 스타일 (선택 사항)
 * @property {() => void} [onChange] - input 값 변경 이벤트 핸들러 (선택 사항)
 * @property {() => void} [onClickSearch] - 검색 버튼 클릭 이벤트 핸들러 (선택 사항)
 * @property {"inHeader" | "inList"} componentType - 스타일 타입 (헤더 또는 리스트용)
 *
 * @author 김어진
 * @updated 2025-09-16
 */

"use client";
import React, { forwardRef } from "react";
import clsx from "clsx";
import IconNode from "../segment/IconNode";
import styles from "./styles/InputSearch.module.scss";

interface InputComponentProps {
	name?: string;
	value?: string;
	width?: string;
	onChange?: any;
	onClickSearch?: any;
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	componentType: "inHeader" | "inList";
}

const InputSearch = forwardRef<HTMLInputElement, InputComponentProps>(({
	name,
	value,
	width,
	onChange,
	onClickSearch,
	onKeyDown,
	componentType = "inList",
}, ref) => {
	return (
		<>
			<div className={styles.inputContainer}>
				<input
					ref={ref}
					name={name}
					value={value}
					type="text"
					onChange={onChange}
					onKeyDown={onKeyDown}
					className={styles[componentType]}
					style={{width: width}}
				/>
				<button
					className={clsx(styles.searchButton, styles.icon)}
					onClick={onClickSearch}
				>
					<IconNode iconName="searchThin" size={15} />
				</button>
			</div>
		</>
	);
});

InputSearch.displayName = "InputSearch";

export default InputSearch;
