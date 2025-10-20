"use client";
import styles from "./styles/TextEditor.module.scss";
import {useEffect, useRef} from "react";

import {useEditor, EditorContent, Editor} from "@tiptap/react";
import {debounce} from "lodash";
import {FakeInputEvent} from "@/components/common/form-properties/types";

import {GlobalClassAttr} from "./extension/global-class-attr";
import {ResizableImage} from "./extension/resizeable-image";
import {TableAlign} from "./extension/table-align";
import {InlineData} from "./extension/inline-data";
import {DivParagraph} from "./extension/div-paragraph";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Strike from "@tiptap/extension-strike";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";

import ImageDragDrop from "./extension/image-drag-drop";
import FontSize from "./extension/font-size";
import TableCellAttr from "./extension/table-cell-attribute";
import RemoveHideSelection from "./extension/remove-hide-selection";
import TextEditorToolbar from "./parts/TextEditorToolbar";

type Props = {
	name: string;
	value?: string;
	onChange?: any;
	etc?: any;
};

export default function TextEditor({name, value, onChange, etc}: Props) {
	const lastContentRef = useRef<string>("");

	const onChangeContent = debounce((editor: Editor) => {
		const newContent = editor.getHTML();

		// 내용이 실제로 변경되었을 때만 onChange 호출
		if (newContent !== lastContentRef.current) {
			lastContentRef.current = newContent;

			const fakeEvent = {
				target: {
					name: name,
					value: newContent,
				},
			} as unknown as FakeInputEvent;

			onChange?.(fakeEvent);
		}
	}, 200); // debounce 시간을 약간 늘림

	const editor = useEditor({
		extensions: [
			GlobalClassAttr,
			StarterKit.configure({
				paragraph: false,
			}),
			DivParagraph,
			Underline,
			Color,
			TextStyle.configure({mergeNestedSpanStyles: true}),
			Highlight.configure({multicolor: true}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
				alignments: ["left", "center", "right", "justify"],
				defaultAlignment: "left",
			}),
			Strike,
			Subscript,
			Superscript,
			FontSize,
			TableAlign.configure({
				resizable: true,
				allowTableNodeSelection: true,
				cellMinWidth: 40,
			}),
			TableRow,
			TableHeader,
			TableCellAttr,
			ImageDragDrop,
			ResizableImage,
			TableCellAttr,
			RemoveHideSelection,
			InlineData,
		],
		content: value,
		immediatelyRender: false,
		onUpdate: ({editor}: {editor: Editor}) => {
			// 에디터가 포커스를 잃지 않도록 비동기 처리
			setTimeout(() => {
				onChangeContent(editor);
			}, 0);
		},
	});

	useEffect(() => {
		// setContent는 팁탭에서 에디터 내용을 프로그래밍으로 설정할 때 사용하는 함수
		if (editor && etc?.mode && value !== lastContentRef.current) {
			// 내용이 실제로 다를 때만 setContent 호출
			lastContentRef.current = value || "";
			// React가 렌더링 끝난 다음 작업(마이크로태스크) 예약
			queueMicrotask(() => {
				if (editor && !editor.isFocused) {
					// 포커스가 없을 때만 설정
					editor.commands.setContent(value ? value : "");
				}
			});
		}
	}, [editor, value, etc?.mode]);

	return (
		<section className={styles.wrapper}>
			<div className={styles.editor}>
				<TextEditorToolbar editor={editor} />
				<EditorContent editor={editor} className={styles.content} />
			</div>
		</section>
	);
}
