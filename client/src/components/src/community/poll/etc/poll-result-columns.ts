import {ColumnDef} from "@tanstack/react-table";
import {GridIndex} from "@/components/common/data-display/GridCustomColumn";

export const getPollResultColumns = (): ColumnDef<any>[] => [
	GridIndex(),
	{
		header: "응답자",
		accessorKey: "respondent",
	},
	{
		header: "사번",
		accessorKey: "empNo",
	},
	{
		header: "성명",
		accessorKey: "korNm",
	},
	{
		header: "부서",
		accessorKey: "deptNm",
	},
	{
		header: "답변",
		accessorKey: "answer",
		cell: (info) => {
			const value = info.getValue() as string;
			return value;
		},
	},
];
