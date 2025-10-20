/**
 * @fileoverview FontSize 확장 모듈
 * @description TextEditor 에디터에 글꼴 크기 변경 기능을 추가하는 확장 모듈
 *
 * @component
 * - `fontSize` 마크를 추가하여 텍스트의 글꼴 크기를 동적으로 조절할 수 있음
 * - `setFontSize` 명령어를 통해 특정 크기로 글꼴 크기를 설정할 수 있음
 *
 * @dependencies
 * - @tiptap/core: TextEditor 에디터 핵심 모듈
 * - mergeAttributes: TextEditor 에디터에서 HTML 속성을 병합하는 유틸리티 함수
 *
 * @author 김어진
 */

import {Mark, mergeAttributes} from "@tiptap/core";

const FontSize = Mark.create({
	name: "fontSize",

	addAttributes() {
		return {
			size: {
				default: null,
				parseHTML: (el: any) => el.style.fontSize || null,
				renderHTML: (attrs: any) => {
					if (!attrs.size) return {};
					return {style: `font-size: ${attrs.size}`};
				},
			},
		};
	},

	parseHTML() {
		return [{style: "font-size"}];
	},

	renderHTML({HTMLAttributes}: any) {
		return ["span", mergeAttributes(HTMLAttributes), 0];
	},

	addCommands() {
		return {
			setFontSize:
				(size: string) =>
				({chain}: any) => {
					return chain().setMark("fontSize", {size}).run();
				},
		};
	},
});

export default FontSize;
