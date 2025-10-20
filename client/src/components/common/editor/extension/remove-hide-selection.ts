import {Plugin} from "prosemirror-state";
import {Extension} from "@tiptap/core";

const removeHideSelectionPlugin = new Plugin({
	view(editorView) {
		return {
			update() {
				editorView.dom.classList.remove("ProseMirror-hideselection");
			},
		};
	},
});

const RemoveHideSelection = Extension.create({
	name: "removeHideSelection",
	addProseMirrorPlugins() {
		return [removeHideSelectionPlugin];
	},
});
export default RemoveHideSelection;
