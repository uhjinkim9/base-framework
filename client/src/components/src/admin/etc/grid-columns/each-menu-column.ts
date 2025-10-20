import {ColumnDef} from "@tanstack/react-table";
import {
	GridIndex,
	GridCheck,
	GridButton,
} from "@/components/common/data-display/GridCustomColumn";
import {BoardMenuCheckedItemType} from "../admin-type";

const getBaseColumns = (
	handleCheckRow: (rowIdx: number, rowData: any, checked: boolean) => void,
	checkedRowIds: BoardMenuCheckedItemType
): ColumnDef<any>[] => [
	GridIndex(),
	GridCheck("선택", handleCheckRow, checkedRowIds),
	{header: "메뉴 ID", accessorKey: "menuId"},
];

export const getFirstBoardMenuColumns = (
	handleCheckRow: (rowIdx: number, rowData: any, checked: boolean) => void,
	checkedRowIds: BoardMenuCheckedItemType,
	onClickEdit: (rowIndex: number, rowData: any) => void
): ColumnDef<any>[] => [
	...getBaseColumns(handleCheckRow, checkedRowIds),
	{header: "메뉴명", accessorKey: "menuNm"},
	{header: "레벨", accessorKey: "nodeLevel"},
	{header: "상위", accessorKey: "upperNode"},
	{header: "순서", accessorKey: "seqNum"},
	{
		header: "사용",
		accessorKey: "isUsed",
		cell: ({getValue}) => (getValue() ? "○" : "✖"),
	},
	GridButton("수정", "수정", onClickEdit),
];

// '하위 메뉴' 없음
export const getSecondBoardMenuColumns = (
	handleCheckRow: (rowIdx: number, rowData: any, checked: boolean) => void,
	checkedRowIds: BoardMenuCheckedItemType,
	onClickEdit: (rowIndex: number, rowData: any) => void,
	handleCheckByType: (
		rowIdx: any,
		rowData: any,
		checked: boolean,
		type: "usingPrefix" | "allowedCmt" | "isAnonymous"
	) => void
): ColumnDef<any>[] => [
	...getBaseColumns(handleCheckRow, checkedRowIds),
	{header: "종류", accessorKey: "boardType"},
	{header: "말머리", accessorKey: "usingPrefix"},
	{header: "댓글", accessorKey: "allowedCmt"},
	{header: "익명", accessorKey: "isAnonymous"},
	{header: "읽기1", accessorKey: "readableUsers"},
	{header: "읽기2", accessorKey: "readableDepts"},
	{header: "쓰기1", accessorKey: "writableUsers"},
	{header: "쓰기2", accessorKey: "writableDepts"},

	GridCheck(
		"말머리 사용",
		(rowIdx, rowData, checked) =>
			handleCheckByType(rowIdx, rowData, checked, "usingPrefix"),
		checkedRowIds.checkedUsingPrefix,
		undefined,
		(rowData) => `${rowData.roleId}|${rowData.menuId}`
	),
	GridCheck(
		"댓글 허용",
		(rowIdx, rowData, checked) =>
			handleCheckByType(rowIdx, rowData, checked, "allowedCmt"),
		checkedRowIds.checkedAllowedCmt,
		undefined,
		(rowData) => `${rowData.roleId}|${rowData.menuId}`
	),
	GridCheck(
		"익명",
		(rowIdx, rowData, checked) =>
			handleCheckByType(rowIdx, rowData, checked, "isAnonymous"),
		checkedRowIds.checkedIsAnonymous,
		undefined,
		(rowData) => `${rowData.roleId}|${rowData.menuId}`
	),
];
