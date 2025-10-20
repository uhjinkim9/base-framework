import {Mark} from "@tiptap/core";

export const InlineData = Mark.create({
	name: "inlineData",
	addAttributes() {
		return {
			class: {default: null},
			"data-token": {default: null},
		};
	},
	parseHTML() {
		return [{tag: "span"}];
	},
	renderHTML({HTMLAttributes}) {
		return ["span", HTMLAttributes, 0];
	},
});
