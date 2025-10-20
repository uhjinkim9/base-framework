import TableCell from "@tiptap/extension-table-cell";
import {Command} from "@tiptap/core";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		rowHeightCell: {
			setRowHeight: (heightPx: number) => ReturnType;
			unsetRowHeight: () => ReturnType;
		};
	}
}

// Extends TableCell to support vertical sizing via a rowHeight attribute
const RowHeightCell = TableCell.extend({
	name: "rowHeightCell",

	addAttributes() {
		return {
			...this.parent?.(),
			rowHeight: {
				default: null,
				parseHTML: (element) => {
					const el = element as HTMLElement;
					const data = el.getAttribute("data-row-height");
					const styleHeight = (el.style && el.style.height) || null;
					return data ?? styleHeight ?? null;
				},
				renderHTML: (attributes) => {
					const style: Record<string, string> = {};
					const value = attributes.rowHeight;
					if (value) {
						const v = String(value);
						style.height = v.endsWith("px") ? v : `${v}px`;
					}
					return {
						"data-row-height": attributes.rowHeight || null,
						style,
					};
				},
			},
		};
	},

	addCommands() {
		return {
			setRowHeight:
				(heightPx: number): Command =>
				({chain}) => {
					const value = `${Math.max(12, Math.round(heightPx))}px`;
					return chain().setCellAttribute("rowHeight", value).run();
				},
			unsetRowHeight:
				(): Command =>
				({chain}) =>
					chain().setCellAttribute("rowHeight", null).run(),
		};
	},
});

export default RowHeightCell;
