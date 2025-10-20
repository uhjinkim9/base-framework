import {ColumnDef} from "@tanstack/react-table";

export type GridProps<T> = {
	data: T[];
	columns: ColumnDef<T, any>[]; // generic column 정의
	onUpdate?: (row: RowProps) => void; // 셀 업데이트 콜백
	onRowClick?: (row: T) => void; // 행 클릭 이벤트 핸들러,
};

export type RowProps = {
	idx: number; // 배열 인덱스
	name: string; // colId
	value: string;
};

export type MetaProps = {
	editable?: boolean;
};
