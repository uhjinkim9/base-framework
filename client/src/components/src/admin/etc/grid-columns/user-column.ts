import {ColumnDef} from "@tanstack/react-table";
import {
	GridIndex,
	GridCheck,
} from "@/components/common/data-display/GridCustomColumn";
import {dateTimeWithPeriod} from "@/util/helpers/formatters";

export const getUserColumn = (
	handleCheckRow: (rowIdx: number, rowData: any, checked: boolean) => void,
	checkedRowIds: Set<string>
): ColumnDef<any>[] => [
	GridIndex(),
	GridCheck("선택", handleCheckRow, checkedRowIds, "userId"),
	{header: "사용자 ID", accessorKey: "userId"},
	// {header: "회사 ID", accessorKey: "companyId"},
	{header: "사용자명", accessorKey: "userNm"},
	{header: "사번", accessorKey: "empNo"},
	{
		header: "사용",
		accessorKey: "isUsed",
		cell: ({getValue}) => (getValue() ? "○" : "✖"),
	},
	{
		header: "제한",
		accessorKey: "isRestricted",
		cell: ({getValue}) => (getValue() ? "○" : "✖"),
	},
	{header: "역할 ID", accessorKey: "roleId"},
	{header: "로그인 실패 횟수", accessorKey: "loginFailCount"},
	{header: "이메일", accessorKey: "email"},
	{header: "외부 이메일", accessorKey: "extEmail"},
	{
		header: "이메일 구독",
		accessorKey: "isEmailSubscribed",
		cell: ({getValue}) => (getValue() ? "○" : "✖"),
	},
	{
		header: "생성일",
		accessorKey: "createdAt",
		cell: ({getValue}) =>
			dateTimeWithPeriod(new Date(getValue() as string)),
	},
	{
		header: "수정일",
		accessorKey: "updatedAt",
		cell: ({getValue}) =>
			dateTimeWithPeriod(new Date(getValue() as string)),
	},
	{
		header: "삭제일",
		accessorKey: "deletedAt",
		cell: ({getValue}) =>
			dateTimeWithPeriod(new Date(getValue() as string)),
	},
];
