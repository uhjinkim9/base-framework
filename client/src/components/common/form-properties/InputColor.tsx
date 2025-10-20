"use client";

import {useState, useRef, useEffect} from "react";
import ColoredCircle from "../segment/ColoredCircle";
import styles from "./styles/InputColor.module.scss";

interface InputColorProps {
	name: string;
	value: any;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	readOnly?: boolean;
	placeholder?: string;
}

const InputColor = ({
	name,
	value,
	onChange,
	readOnly,
	placeholder,
}: InputColorProps) => {
	const [showPicker, setShowPicker] = useState(false);
	const [tempValue, setTempValue] = useState(value);
	const [isMouseDown, setIsMouseDown] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleClickOutside = (e: MouseEvent) => {
		if (
			wrapperRef.current &&
			!wrapperRef.current.contains(e.target as Node)
		) {
			setShowPicker(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("mouseup", handleMouseUp);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isMouseDown, tempValue, onChange, name]);

	// value prop이 변경되면 tempValue도 동기화
	useEffect(() => {
		setTempValue(value);
	}, [value]);

	const handleClickCircle = () => {
		setShowPicker(true);
		setTempValue(value); // 현재 값으로 임시 값 초기화
		inputRef.current?.click();
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// 드래그 중에는 임시 값만 업데이트
		setTempValue(e.target.value);
	};

	const handleMouseDown = () => {
		setIsMouseDown(true);
	};

	const handleMouseUp = () => {
		if (isMouseDown && onChange) {
			// 마우스를 놓을 때만 실제 onChange 호출
			const syntheticEvent = {
				target: { 
					name, 
					value: tempValue 
				}
			} as React.ChangeEvent<HTMLInputElement>;
			onChange(syntheticEvent);
		}
		setIsMouseDown(false);
	};

	return (
		<div className={styles.wrapper} ref={wrapperRef}>
			<input
				ref={inputRef}
				className={styles.hiddenInput}
				type="color"
				name={name}
				value={tempValue || value || "#000000"}
				onChange={handleInputChange}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				readOnly={readOnly}
				placeholder={placeholder}
			></input>
			<div className={styles.circle} onClick={handleClickCircle}>
				<ColoredCircle colorCode={isMouseDown ? tempValue : (value === "" ? "#000" : value)} />
			</div>
		</div>
	);
};

export default InputColor;
