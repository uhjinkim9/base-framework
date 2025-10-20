import Paragraph from "@tiptap/extension-paragraph";
import {mergeAttributes} from "@tiptap/core";

const BLOCK_DESC_SELECTOR =
	"table, thead, tbody, tfoot, tr, td, th, ul, ol, li, hr, h1, h2, h3, h4, h5, h6, blockquote";

export const DivParagraph = Paragraph.extend({
	name: "paragraph",
	parseHTML() {
		return [
			{tag: "p"},
			{
				tag: "div",
				getAttrs: (el) => {
					const node = el as HTMLElement;
					const cls = node.getAttribute("class") ?? "";

					// 1) 표 래퍼/노드뷰/프로스미러 UI 등은 배제
					if (/\btableWrapper\b/.test(cls)) return false;
					if (/\breact-renderer\b/.test(cls)) return false;
					if (/\bProseMirror\b/.test(cls)) return false;

					// 2) 내부에 블록 레벨이 있으면 문단으로 보지 않음
					if (node.querySelector(BLOCK_DESC_SELECTOR)) return false;

					// 3) 여기까지 통과한 div만 paragraph로 인정
					return {};
				},
			},
		];
	},
	renderHTML({HTMLAttributes}) {
		// 렌더는 계속 div로 (원하면 여기서 t-paragraph를 달아도 됨)
		return [
			"div",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
			0,
		];
	},
	addKeyboardShortcuts() {
		return {
			Enter: () => {
				// 엔터 키를 눌렀을 때 새로운 paragraph 대신 <br> 태그 삽입
				return this.editor.commands.setHardBreak();
			},
			"Shift-Enter": () => this.editor.commands.splitBlock(),
		};
	},
});
