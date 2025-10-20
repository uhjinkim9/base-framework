"use client";
import React from "react";
import {
	LuTableCellsMerge,
	LuTable,
	LuArrowLeftToLine,
	LuArrowRightToLine,
	LuArrowUpFromLine,
	LuArrowDownToLine,
	LuRows3,
	LuColumns3,
	LuDelete,
	LuTableCellsSplit,
} from "react-icons/lu";
import Tooltip from "../../segment/Tooltip";

type Props = {
	editor?: any;
};

export default function TableLayout({editor}: Props) {
	return (
		<>
			<Tooltip text="표 생성">
				<button
					onClick={() =>
						editor.commands.insertTable({
							rows: 3,
							cols: 3,
							withHeaderRow: false,
						})
					}
				>
					<LuTable />
				</button>
			</Tooltip>
			<Tooltip text="셀 병합">
				<button onClick={() => editor.commands.mergeCells()}>
					<LuTableCellsMerge />
				</button>
			</Tooltip>
			<Tooltip text="셀 분할">
				<button onClick={() => editor.commands.splitCell()}>
					<LuTableCellsSplit />
				</button>
			</Tooltip>

			<Tooltip text="앞 열 추가">
				<button onClick={() => editor.commands.addColumnBefore()}>
					<LuArrowLeftToLine />
				</button>
			</Tooltip>
			<Tooltip text="뒤 열 추가">
				<button onClick={() => editor.commands.addColumnAfter()}>
					<LuArrowRightToLine />
				</button>
			</Tooltip>

			<Tooltip text="위 행 추가">
				<button onClick={() => editor.commands.addRowBefore()}>
					<LuArrowUpFromLine />
				</button>
			</Tooltip>
			<Tooltip text="아래 행 추가">
				<button onClick={() => editor.commands.addRowAfter()}>
					<LuArrowDownToLine />
				</button>
			</Tooltip>

			<Tooltip text="선택 열 삭제">
				<button onClick={() => editor.commands.deleteColumn()}>
					<LuColumns3 />
					<LuDelete />
				</button>
			</Tooltip>
			<Tooltip text="선택 행 삭제">
				<button onClick={() => editor.commands.deleteRow()}>
					<LuRows3 />
					<LuDelete />
				</button>
			</Tooltip>
			<Tooltip text="표 삭제">
				<button onClick={() => editor.commands.deleteTable()}>
					<LuDelete />
				</button>
			</Tooltip>
		</>
	);
}
