// extensions/table-align-schema.ts
import {Table} from "@tiptap/extension-table";
import {mergeAttributes} from "@tiptap/core";

type Align = "left" | "center" | "right";
const ALIGN_RE = /\btable-align-(left|center|right)\b/gi;
const MARGIN_RE = /margin-(left|right)\s*:\s*[^;]+;?/gi;

export const TableAlign = Table.extend({
	name: "table",
	priority: 1000,

	parseHTML() {
		return [
			// wrapper 경로로 들어와도 table의 class/style을 attrs로 흡수
			{
				tag: "div.tableWrapper",
				contentElement: "table",
				getAttrs: (wrapper: HTMLElement) => {
					const t = wrapper.querySelector(
						"table"
					) as HTMLElement | null;
					if (!t) return false;
					return {
						class: t.getAttribute("class") || null,
						style: t.getAttribute("style") || null,
					};
				},
			},
			// table 직접
			{
				tag: "table",
				contentElement: "tbody", // tbody 밑을 콘텐츠로 읽게 고정
				getAttrs: (el: HTMLElement) => ({
					class: el.getAttribute("class") || null,
					style: el.getAttribute("style") || null,
				}),
			},
		];
	},

	addAttributes() {
		return {
			...this.parent?.(),
			class: {
				default: null,
				parseHTML: (el: HTMLElement) =>
					el.getAttribute("class") || null,
				renderHTML: (attrs: any) =>
					attrs.class ? {class: attrs.class} : {},
			},
			style: {
				default: null,
				parseHTML: (el: HTMLElement) =>
					el.getAttribute("style") || null,
				renderHTML: (attrs: any) =>
					attrs.style ? {style: attrs.style} : {},
			},
		};
	},

	renderHTML({HTMLAttributes}) {
		const {class: cls, style, ...rest} = HTMLAttributes ?? {};
		const tableAttrs = mergeAttributes(
			rest,
			cls ? {class: cls} : {},
			style ? {style} : {}
		);
		return [
			"div",
			{class: "tableWrapper"},
			["table", tableAttrs, ["tbody", 0]],
		];
	},

	addCommands() {
		return {
			...this.parent?.(),
			setTableAlign:
				(alignment: Align) =>
				({editor, commands}: any) => {
					const cur = editor.getAttributes("table") as {
						class?: string;
						style?: string;
					};
					const nextClass =
						[
							(cur.class ?? "").replace(ALIGN_RE, "").trim(),
							`table-align-${alignment}`,
						]
							.filter(Boolean)
							.join(" ")
							.replace(/\s+/g, " ") || null;

					const cleaned = (cur.style ?? "")
						.replace(MARGIN_RE, "")
						.trim();
					const sep = cleaned && !cleaned.endsWith(";") ? ";" : "";
					const margin =
						alignment === "center"
							? "margin-left:auto;margin-right:auto;"
							: alignment === "right"
							? "margin-left:auto;margin-right:0;"
							: "margin-left:0;margin-right:auto;";
					const nextStyle = `${cleaned}${sep}${margin}` || null;

					return commands.updateAttributes("table", {
						class: nextClass,
						style: nextStyle,
					});
				},
		};
	},
});

// // TableAlign.ts
// import {Table} from "@tiptap/extension-table";

// type Align = "left" | "center" | "right";

// const ALIGN_CLASS_RE = /\btable-align-(left|center|right)\b/gi;
// const MARGIN_RE = /margin-(left|right)\s*:\s*[^;]+;?/gi;

// const TableAlign = Table.extend({
// 	name: "table",

// 	addAttributes() {
// 		return {
// 			...this.parent?.(),
// 			// 1) 시각용 클래스 (기존 다른 클래스는 보존)
// 			class: {
// 				default: null,
// 				parseHTML: (el: HTMLElement) =>
// 					el.getAttribute("class") || null,
// 				renderHTML: (attrs: any) =>
// 					attrs.class ? {class: attrs.class} : {},
// 			},
// 			// 2) getHTML 보존용 스타일 (margin만 관리, 나머지는 보존)
// 			style: {
// 				default: null,
// 				parseHTML: (el: HTMLElement) =>
// 					el.tagName === "TABLE"
// 						? el.getAttribute("style") || null
// 						: null,
// 				renderHTML: (attrs: any) =>
// 					attrs.style ? {style: attrs.style} : {},
// 			},
// 		};
// 	},

// 	addCommands() {
// 		return {
// 			...this.parent?.(),
// 			setTableAlign:
// 				(alignment: Align) =>
// 				({editor, commands}: any) => {
// 					const cur = editor.getAttributes("table") as {
// 						class?: string;
// 						style?: string;
// 					};
// 					const prevClass = (cur.class ?? "").trim();
// 					const prevStyle = (cur.style ?? "").trim();

// 					// 클래스: 기존 table-align-* 토큰만 제거 → 새 토큰으로 교체 (다른 클래스 유지)
// 					const classWithoutOld = prevClass
// 						.replace(ALIGN_CLASS_RE, "")
// 						.trim();
// 					const className = [
// 						classWithoutOld,
// 						`table-align-${alignment}`,
// 					]
// 						.filter(Boolean)
// 						.join(" ")
// 						.replace(/\s+/g, " ");

// 					// 스타일: 기존 margin-left/right만 제거 → 새 margin만 주입 (다른 스타일 유지)
// 					const styleWithoutMargins = prevStyle
// 						.replace(MARGIN_RE, "")
// 						.trim();
// 					const marginStyle =
// 						alignment === "center"
// 							? "margin-left:auto;margin-right:auto;"
// 							: alignment === "right"
// 							? "margin-left:auto;margin-right:0;"
// 							: "margin-left:0;margin-right:auto;";
// 					const sep =
// 						styleWithoutMargins &&
// 						!styleWithoutMargins.endsWith(";")
// 							? ";"
// 							: "";
// 					const nextStyle = `${styleWithoutMargins}${sep}${marginStyle}`;

// 					// 1) Node attrs 업데이트 (getHTML에 반영)
// 					const ok = commands.updateAttributes("table", {
// 						class: className || null,
// 						style: nextStyle || null,
// 					});

// 					// 2) 즉시 시각 반영이 안 될 경우를 위한 DOM 패치(부드러운 폴백)
// 					try {
// 						const {view, state} = editor;
// 						const {$from} = state.selection;
// 						let el =
// 							(view.domAtPos($from.pos).node as Element) || null;
// 						if (el && el.nodeType === 3)
// 							el = el.parentElement as Element; // 텍스트 노드면 부모로
// 						while (el && el !== (view.dom as unknown as Element)) {
// 							if (el.tagName === "TABLE") {
// 								// align 토큰만 교체, 다른 클래스는 그대로
// 								const current = (el.getAttribute("class") || "")
// 									.replace(ALIGN_CLASS_RE, "")
// 									.trim();
// 								const merged = [
// 									current,
// 									`table-align-${alignment}`,
// 								]
// 									.filter(Boolean)
// 									.join(" ")
// 									.replace(/\s+/g, " ");
// 								el.setAttribute("class", merged);
// 								break;
// 							}
// 							el = el.parentElement as Element;
// 						}
// 					} catch {
// 						/* no-op */
// 					}

// 					return ok;
// 				},
// 		};
// 	},
// });

// export default TableAlign;
