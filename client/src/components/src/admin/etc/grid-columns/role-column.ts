import {ColumnDef} from "@tanstack/react-table";

import {
	GridIndex,
	GridCheck,
	GridButton,
} from "@/components/common/data-display/GridCustomColumn";

import {NodeLevelType} from "@/types/menu.type";
import {CheckedRowsType} from "../admin-type";

export const getFirstRoleColumns = (
	handleCheckRow: (
		rowIdx: any,
		rowData: any,
		checked: boolean,
		type: NodeLevelType
	) => void,
	checkedRows: CheckedRowsType,
	onClickLowerMenu: (rowIndex: number, rowData: any) => void,
	onClickEdit: (rowIndex: number, rowData: any, type: NodeLevelType) => void
): ColumnDef<any>[] => [
	GridIndex(),
	GridCheck(
		"선택",
		(rowIdx, rowData, checked) =>
			handleCheckRow(rowIdx, rowData, checked, "upper"),
		checkedRows.upperCheckedRow,
		"roleId"
	),
	{header: "역할 ID", accessorKey: "roleId"},
	{header: "역할명", accessorKey: "roleNm"},
	GridButton("수정", "수정", (rowIdx, rowData) =>
		onClickEdit(rowIdx, rowData, "upper")
	),
	GridButton("메뉴", "메뉴", onClickLowerMenu),
];

export const getSecondRoleColumns = (
	handleCheckRow: (
		rowIdx: any,
		rowData: any,
		checked: boolean,
		type: NodeLevelType
	) => void,
	handleCheckAuthReading: (
		rowIdx: any,
		rowData: any,
		checked: boolean
	) => void,
	handleCheckAuthWriting: (
		rowIdx: any,
		rowData: any,
		checked: boolean
	) => void,
	checkedRows: CheckedRowsType,
	onClickEdit: (rowIndex: number, rowData: any, type: NodeLevelType) => void
): ColumnDef<any>[] => [
	GridIndex(),
	// GridCheck("선택", handleCheckRow, checkedRows.checkedRow, "roleId"),
	GridCheck(
		"선택",
		(rowIdx, rowData, checked) =>
			handleCheckRow(rowIdx, rowData, checked, "lower"),
		checkedRows.lowerCheckedRow,
		"menuId"
	),
	{header: "메뉴 ID", accessorKey: "menuId"},
	{header: "메뉴명", accessorKey: "menuNm"},
	{header: "레벨", accessorKey: "nodeLevel"},
	GridCheck(
		"사용자",
		handleCheckAuthReading,
		checkedRows.checkedReading,
		undefined,
		(rowData) => `${rowData.roleId}|${rowData.menuId}`
	),
	GridCheck(
		"관리자",
		handleCheckAuthWriting,
		checkedRows.checkedWriting,
		undefined,
		(rowData) => `${rowData.roleId}|${rowData.menuId}`
	),
	GridButton("수정", "수정", (rowIdx, rowData) =>
		onClickEdit(rowIdx, rowData, "lower")
	),
	// GridButton("수정", "수정", onClickEdit),
];
