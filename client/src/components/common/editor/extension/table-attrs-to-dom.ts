// extensions/table-attrs-to-dom.ts
import {Extension} from "@tiptap/core";
import {Plugin} from "prosemirror-state";

export const TableAttrsToDOM = Extension.create({
	name: "tableAttrsToDOM",
	priority: 1000, // Table NodeView 이후에 돌아도 되지만 높여두면 안전

	addProseMirrorPlugins() {
		const sync = (view: any) => {
			const {state} = view;
			state.doc.descendants((node: any, pos: number) => {
				if (node.type?.name !== "table") return;

				// TipTap Table NodeView의 래퍼(dom) = div.tableWrapper
				const wrapper = view.nodeDOM(pos) as HTMLElement | null;
				if (!wrapper || !wrapper.querySelector) return;

				const table = wrapper.querySelector(
					"table"
				) as HTMLElement | null;
				if (!table) return;

				// 1) class 동기화
				const cls = node.attrs?.class ?? null;
				if (cls) table.setAttribute("class", cls);
				else table.removeAttribute("class");

				// 2) style 동기화
				const sty = node.attrs?.style ?? null;
				if (sty) table.setAttribute("style", sty);
				else table.removeAttribute("style");
			});
		};

		return [
			new Plugin({
				view(editorView) {
					// mount 시 1회, 이후 트랜잭션마다 동기화
					queueMicrotask(() => sync(editorView));
					return {
						update(view) {
							sync(view);
						},
					};
				},
			}),
		];
	},
});
