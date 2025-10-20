import {Extension} from "@tiptap/core";
import {Plugin, PluginKey} from "prosemirror-state";
import {Decoration, DecorationSet, EditorView} from "prosemirror-view";

const RowResizeKey = new PluginKey("row-resize");

export default Extension.create({
	name: "rowResize",

	addProseMirrorPlugins() {
		const editor = this.editor;
		return [
			new Plugin<DecorationSet>({
				key: RowResizeKey,

				state: {
					init: (_config, {doc}) => buildRowHandles(doc),
					apply(tr, set) {
						if (tr.docChanged || tr.selectionSet)
							return buildRowHandles(tr.doc);
						return set.map(tr.mapping, tr.doc);
					},
				},

				props: {
					decorations(state) {
						return RowResizeKey.getState(state);
					},
					handleDOMEvents: {
						mousedown: (view, event) => {
							const target = event.target as HTMLElement;
							if (
								!target?.classList?.contains(
									"pm-row-resize-handle"
								)
							)
								return false;
							event.preventDefault();
							const rowIndex = Number(
								target.dataset.rowIndex || -1
							);
							if (rowIndex < 0) return false;
							startDrag(
								view,
								editor,
								rowIndex,
								event as MouseEvent
							);
							return true;
						},
					},
				},
			}),
		];
	},
});

function buildRowHandles(doc: any): DecorationSet {
	const decos: Decoration[] = [] as any;
	doc.descendants((node: any, pos: number) => {
		if (node.type?.name !== "table") return;

		let rowOffset = 0;
		node.forEach((rowNode: any, _rowPos: number, rowIndex: number) => {
			const handle = document.createElement("div");
			handle.className = "pm-row-resize-handle";
			handle.dataset.rowIndex = String(rowIndex);

			const widgetPos = pos + 1 + rowOffset + rowNode.nodeSize - 1;
			decos.push(Decoration.widget(widgetPos, handle, {side: 1}));
			rowOffset += rowNode.nodeSize;
		});
		return false;
	});
	return DecorationSet.create(doc, decos);
}

function startDrag(
	view: EditorView,
	editor: any,
	rowIndex: number,
	e: MouseEvent
) {
	const startY = e.clientY;
	const base = getRowHeightFromDOM(view, rowIndex) ?? 32;

	const move = (ev: MouseEvent) => {
		const delta = ev.clientY - startY;
		const next = Math.max(12, Math.round(base + delta));
		editor?.chain().focus().setRowHeight?.(next).run();
	};

	const up = () => {
		window.removeEventListener("mousemove", move);
		window.removeEventListener("mouseup", up);
	};

	window.addEventListener("mousemove", move);
	window.addEventListener("mouseup", up);
}

function getRowHeightFromDOM(
	view: EditorView,
	rowIndex: number
): number | null {
	const dom = view.dom as HTMLElement;
	const tables = dom.querySelectorAll("table");
	if (!tables.length) return null;
	const table = tables[0];
	const rows = table.querySelectorAll("tr");
	const row = rows[rowIndex] as HTMLElement | undefined;
	if (!row) return null;
	const anyCell = (row.querySelector("td, th") as HTMLElement) || row;
	const data = anyCell.getAttribute("data-row-height") || "";
	const styleH = anyCell.style.height || "";
	const rectH = Math.round(anyCell.getBoundingClientRect().height);
	const parsed = parseInt(data || styleH || String(rectH), 10);
	return Number.isFinite(parsed) ? parsed : null;
}
