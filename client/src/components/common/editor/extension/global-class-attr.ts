import {Extension} from "@tiptap/core";

export const GlobalClassAttr = Extension.create({
	name: "globalClassAttr",
	priority: 500, // 낮춰도 됨
	addGlobalAttributes() {
		const types = [
			"paragraph",
			"heading",
			"bulletList",
			"orderedList",
			"listItem",
			"blockquote",
			"codeBlock",
			"tableRow",
			"tableCell",
			"tableHeader", // ⬅ 셀/로우는 유지해도 OK
			"image",
		] as const;

		return [
			{
				types: [...types],
				attributes: {
					class: {
						default: null,
						keepOnSplit: true,
						parseHTML: (el: HTMLElement) =>
							el.getAttribute("class") || null,
						renderHTML: (attrs: any) =>
							attrs.class ? {class: attrs.class} : {},
					},
				},
			},
		];
	},
});
