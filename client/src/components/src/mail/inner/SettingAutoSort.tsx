"use client";
import styles from "../styles/MailSetting.module.scss";
import clsx from "clsx";
import {useState} from "react";

import Divider from "@/components/common/segment/Divider";
import Button from "@/components/common/form-properties/Button";
import Grid from "@/components/common/data-display/Grid";
import {
	GridButton,
	GridIndex,
	GridEditableInput,
	GridCheck,
} from "@/components/common/data-display/GridCustomColumn";
import IconNode from "@/components/common/segment/IconNode";

type AutoSortData = {
	id?: number;
	category: string;
	filteringWord: string;
	sortingFolder: string;
	isNew?: boolean;
};

export default function SettingAutoSort({mailIdx}: {mailIdx?: number}) {
	const [data, setData] = useState<AutoSortData[]>([
		{
			id: 1,
			category: "보낸 사람", // 범주는 셀렉트 박스로
			filteringWord: "AX",
			sortingFolder: "내 메일함1",
		},
		{
			id: 2,
			category: "제목",
			filteringWord: "None",
			sortingFolder: "내 메일함2",
		},
	]);

	const handleAddForwarding = () => {
		const newRow: AutoSortData = {
			id: Date.now(), // 임시 ID
			category: "",
			filteringWord: "",
			sortingFolder: "",
			isNew: true,
		};
		setData((prev) => [...prev, newRow]);
	};

	const handleInputChange = (
		rowIndex: number,
		rowData: AutoSortData,
		field: keyof AutoSortData,
		value: string
	) => {
		setData((prev) =>
			prev.map((item, index) =>
				index === rowIndex ? {...item, [field]: value} : item
			)
		);
	};

	const handleSave = (rowIndex: number, rowData: AutoSortData) => {
		// 여기서 백엔드에 저장 로직 구현
		console.log("저장할 데이터:", rowData);

		// isNew 플래그 제거
		setData((prev) =>
			prev.map((item, index) =>
				index === rowIndex ? {...item, isNew: false} : item
			)
		);

		// 실제로는 API 호출
		// await saveAutoSortData(rowData);
		alert(`자동 분류 설정이 저장되었습니다: ${rowData.category}`);
	};

	const handleDelete = (rowIndex: number, rowData: AutoSortData) => {
		setData((prev) => prev.filter((_, index) => index !== rowIndex));
		// 백엔드에서 삭제
		// await deleteAutoSortData(rowData.id);
	};

	// 전체 데이터를 백엔드에 저장하는 함수
	const handleSaveAll = async () => {
		try {
			// 실제 API 호출 예시
			// const response = await requestPost('/mail/forwarding/save', { forwardingList: data });
			console.log("전체 자동 분류 설정 저장:", data);
			alert("모든 자동 분류 설정이 저장되었습니다.");
		} catch (error) {
			console.error("저장 실패:", error);
			alert("저장에 실패했습니다.");
		}
	};

	// 그리드에서 선택된 열
	const [checkedRowIds, setCheckedRowIds] = useState<Set<string>>(new Set());

	const handleCheckRow = (rowIdx: any, rowData: any, checked: boolean) => {
		// const {rowIdx} = rowData;
		setCheckedRowIds((prev) => {
			const newSet = new Set(prev);
			checked ? newSet.add(rowIdx) : newSet.delete(rowIdx);
			return newSet;
		});
	};

	const columns = [
		GridIndex(),
		GridCheck("선택", handleCheckRow, checkedRowIds),
		GridEditableInput(
			"범주",
			"category",
			(rowIndex, rowData, value) =>
				handleInputChange(rowIndex, rowData, "category", value),
			{placeholder: "범주 선택"}
		),
		GridEditableInput(
			"필터링 단어",
			"filteringWord",
			(rowIndex, rowData, value) =>
				handleInputChange(rowIndex, rowData, "filteringWord", value),
			{placeholder: "필터링 단어 입력"}
		),
		GridEditableInput(
			"분류할 메일함",
			"sortingFolder",
			(rowIndex, rowData, value) =>
				handleInputChange(rowIndex, rowData, "sortingFolder", value),
			{placeholder: "메일함 선택"}
		),
		// GridButton("저장", "저장", handleSave),
		GridButton("삭제", "삭제", handleDelete),
	];

	return (
		<>
			{/* <div className={clsx(styles.row, styles.gap1rem)}>
				<span className={styles.label}>포워딩 원본 저장</span>
				<Toggle />
			</div>

			<Divider type="middle" /> */}

			<div className={clsx(styles.column, styles.gap1rem)}>
				<Button
					componentType="smallGray"
					width="5rem"
					onClick={handleSaveAll}
					onHoverOpaque
				>
					전체 저장
				</Button>

				<Grid data={data} columns={columns} />

				<IconNode
					onClick={handleAddForwarding}
					iconName="circlePlus"
					size={26}
					color="gray4"
				/>
			</div>
		</>
	);
}
