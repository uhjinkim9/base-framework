import {ColumnDef} from "@tanstack/react-table";
import {
	GridIndex,
	GridCheck,
	GridButton,
} from "@/components/common/data-display/GridCustomColumn";
import {NodeLevelType} from "@/types/menu.type";

export const getProofFormColumns = (
	handleCheckRow: (
		rowIdx: number,
		rowData: any,
		checked: boolean,
		type: NodeLevelType
	) => void,
	checkedRowIds: Set<string>,
	onClickEdit: (rowIndex: number, rowData: any) => void
): ColumnDef<any>[] => [
	GridIndex(),
	GridCheck(
		"선택",
		(rowIdx, rowData, checked) =>
			handleCheckRow(rowIdx, rowData, checked, "upper"),
		checkedRowIds,
		"formId"
	),
	{header: "양식명", accessorKey: "formNm"},
	{header: "설명", accessorKey: "explanation", size: 450},
	{header: "담당자", accessorKey: "managerId", size: 60},
	{header: "도장", accessorKey: "stampId", size: 60},
	{header: "순서", accessorKey: "seqNum", size: 30},
	{
		header: "승인 필요",
		accessorKey: "approvalRequired",
		cell: ({getValue}) => (getValue() ? "○" : "✖"),
		size: 60,
	},
	{
		header: "사용",
		accessorKey: "isUsed",
		cell: ({getValue}) => (getValue() ? "○" : "✖"),
		size: 60,
	},
	GridButton("수정", "수정", onClickEdit),
];
