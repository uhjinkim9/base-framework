"use client";
import {ColumnDef} from "@tanstack/react-table";
import {useState, useEffect, useRef} from "react";

import ButtonBasic from "../form-properties/ButtonBasic";
import SelectBoxBasic from "../form-properties/SelectBoxBasic";
import CheckBox from "../form-properties/CheckBox";
import Radio from "../form-properties/Radio";
import InputBasic from "../form-properties/InputBasic";

export const GridIndex = (): ColumnDef<any> => ({
	header: "번호",
	cell: ({row}) => row.index + 1,
	size: 30,
});

export const GridButton = (
	header: string,
	label: string,
	onClick: (rowIndex: number, rowData: any) => void
): ColumnDef<any> => ({
	header: header,
	cell: ({row}) => (
		<ButtonBasic
			onClick={() => onClick(row.index, row.original)}
			onHoverOpaque
		>
			{label}
		</ButtonBasic>
	),
	size: 50,
});

export const GridCheck = (
	header: string,
	onChange: (rowIdx: any, rowData: any, checked: boolean) => void,
	checkedRows: any,
	key?: string,
	customKeyResolver?: (rowData: any) => string
): ColumnDef<any> => ({
	header: header,
	cell: ({row}) => {
		const rowData = row.original;

		const resolvedKey = customKeyResolver
			? customKeyResolver(rowData)
			: rowData[key ?? "menuId"];

		return (
			<CheckBox
				value={
					checkedRows instanceof Set
						? checkedRows.has(resolvedKey)
						: Array.isArray(checkedRows)
						? checkedRows.some((v) =>
								typeof v === "object"
									? v[key ?? "menuId"] === resolvedKey
									: v === resolvedKey
						  )
						: false
				}
				onChange={(e) =>
					onChange(rowData.idx, rowData, e.target.checked)
				}
				componentType="orange"
			/>
		);
	},
	size: 30,
});

export const GridSelect = (
	header: string,
	fieldKey: string,
	onChange: (rowIndex: number, rowData: any, value: any) => void,
	options?: {
		customOptions?: {label: string; value: any}[];
		codeClass?: string;
		defaultLabel?: string;
		readonly?: boolean;
	}
): ColumnDef<any> => ({
	header: header,
	cell: ({row}) => {
		const rowData = row.original;

		return (
			<SelectBoxBasic
				name={`${fieldKey}_${row.index}`}
				value={rowData[fieldKey]}
				onChange={(e) => onChange(row.index, rowData, e.target.value)}
				customOptions={options?.customOptions}
				codeClass={options?.codeClass}
				defaultLabel={options?.defaultLabel}
				readonly={options?.readonly}
				componentType="basic"
			/>
		);
	},
	size: 150, // 셀렉트박스 컬럼 너비
});

export const GridRadio = (
	header: string,
	fieldKey: string,
	onChange: (rowIndex: number, rowData: any, value: any) => void,
	options: {
		radioGroupName: string; // 라디오 버튼 그룹명 (같은 그룹의 라디오들은 하나만 선택 가능)
		checkValue: string | number; // 이 라디오가 선택되었을 때의 값
		componentType?: "orange" | "gray";
		readOnly?: boolean;
	}
): ColumnDef<any> => ({
	header: header,
	cell: ({row}) => {
		const rowData = row.original;
		const isChecked = rowData[fieldKey] === options.checkValue;

		return (
			<Radio
				name={options.radioGroupName}
				value={isChecked}
				checkValue={options.checkValue}
				onChange={(e) =>
					onChange(row.index, rowData, e.target.checkValue)
				}
				componentType={options.componentType || "orange"}
				readOnly={options.readOnly}
			/>
		);
	},
	size: 50, // 라디오 버튼 컬럼 너비
});

export const GridInput = (
	header: string,
	fieldKey: string,
	onChange: (rowIndex: number, rowData: any, value: string) => void,
	options?: {
		placeholder?: string;
		type?: "text" | "email" | "number";
		readOnly?: boolean;
	}
): ColumnDef<any> => ({
	header: header,
	cell: ({row}) => {
		const rowData = row.original;

		return (
			<InputBasic
				name={`${fieldKey}_${row.index}`}
				value={rowData[fieldKey] || ""}
				onChange={(e: any) =>
					onChange(row.index, rowData, e.target.value)
				}
				placeholder={options?.placeholder}
				type={options?.type || "text"}
				readOnly={options?.readOnly}
			/>
		);
	},
	size: 150,
});

export const GridEditableInput = (
	header: string,
	fieldKey: string,
	onChange: (rowIndex: number, rowData: any, value: string) => void,
	options?: {
		placeholder?: string;
		type?: "text" | "email" | "number";
		readOnly?: boolean;
		displayFormat?: (value: string) => string; // 표시용 포맷터
	}
): ColumnDef<any> => ({
	header: header,
	cell: ({row}) => {
		const EditableCell = () => {
			const rowData = row.original;
			const [isEditing, setIsEditing] = useState(false);
			const [editValue, setEditValue] = useState(rowData[fieldKey] || "");
			const inputRef = useRef<HTMLDivElement>(null);

			const handleDoubleClick = () => {
				if (!options?.readOnly) {
					setIsEditing(true);
					setEditValue(rowData[fieldKey] || "");
				}
			};

			// 편집 모드로 전환 시 포커스 설정
			useEffect(() => {
				if (isEditing) {
					// 약간의 지연을 두고 포커스 설정
					setTimeout(() => {
						const input = inputRef.current?.querySelector("input");
						if (input) {
							input.focus();
							input.select();
						}
					}, 10);
				}
			}, [isEditing]);

			const handleSave = () => {
				onChange(row.index, rowData, editValue);
				setIsEditing(false);
			};

			const handleCancel = () => {
				setEditValue(rowData[fieldKey] || "");
				setIsEditing(false);
			};

			const handleKeyDown = (e: React.KeyboardEvent) => {
				if (e.key === "Enter") {
					e.preventDefault();
					handleSave();
				} else if (e.key === "Escape") {
					e.preventDefault();
					handleCancel();
				}
			};

			// 외부 클릭 감지를 위한 effect
			useEffect(() => {
				if (isEditing) {
					const handleClickOutside = (event: MouseEvent) => {
						if (
							inputRef.current &&
							!inputRef.current.contains(event.target as Node)
						) {
							handleSave();
						}
					};

					document.addEventListener("mousedown", handleClickOutside);
					return () => {
						document.removeEventListener(
							"mousedown",
							handleClickOutside
						);
					};
				}
			}, [isEditing]);

			if (isEditing) {
				return (
					<div ref={inputRef}>
						<InputBasic
							name={`${fieldKey}_${row.index}`}
							value={editValue}
							onChange={(e: any) => setEditValue(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={options?.placeholder}
							type={options?.type || "text"}
						/>
					</div>
				);
			}

			const displayValue = options?.displayFormat
				? options.displayFormat(rowData[fieldKey] || "")
				: rowData[fieldKey] || "";

			return (
				<div
					onDoubleClick={handleDoubleClick}
					style={{
						padding: "8px 12px",
						cursor: options?.readOnly ? "default" : "pointer",
						minHeight: "20px",
						borderRadius: "4px",
						background: "transparent",
						border: "1px solid transparent",
						userSelect: "none",
					}}
					title="더블클릭하여 편집"
				>
					{displayValue || (
						<span style={{color: "#999", fontStyle: "italic"}}>
							{options?.placeholder || "값을 입력하세요"}
						</span>
					)}
				</div>
			);
		};

		return <EditableCell />;
	},
	size: 150,
});
