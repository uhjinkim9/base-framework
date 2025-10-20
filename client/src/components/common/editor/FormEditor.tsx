"use client";
import styles from "./styles/FormEditor.module.scss";
import {ChangeEvent, useEffect, useMemo, useRef, useState} from "react";
import {useEditor, EditorContent, Editor} from "@tiptap/react";
import {debounce} from "lodash";

import {initialMetaField} from "./etc/editor-initial-state";
import {isNotEmpty} from "@/util/validators/check-empty";
import {FakeInputEvent} from "@/components/common/form-properties/types";
import {MetaFieldType} from "./etc/editor.type";

import {TableAttrsToDOM} from "./extension/table-attrs-to-dom";
import {GlobalClassAttr} from "./extension/global-class-attr";
import {ResizableImage} from "./extension/resizeable-image";
import {InlineData} from "./extension/inline-data";
import {TableAlign} from "./extension/table-align";
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
import TableCellAttr from "./extension/table-cell-attribute";
import RowResize from "./extension/row-resize-extension";
import FontSize from "./extension/font-size";
import ImageDragDrop from "./extension/image-drag-drop";
import RenderElement from "./extension/render-element";
import InputBasic from "../form-properties/InputBasic";
import Toggle from "../form-properties/Toggle";
import Divider from "../segment/Divider";
import RemoveHideSelection from "./extension/remove-hide-selection";
import InputTextArea from "../form-properties/InputTextArea";
import {DivParagraph} from "./extension/div-paragraph";
import FormEditorToolbar from "./parts/FormEditorToolbar";

type Props = {
	name: string;
	value?: string;
	onChange: any;
	etc?: any;
	fields: MetaFieldType[];
	setFields: React.Dispatch<React.SetStateAction<MetaFieldType[]>>;
};

export default function FormEditor({
	name,
	value,
	onChange,
	etc,
	fields,
	setFields,
}: Props) {
	const lastContentRef = useRef<string>("");

	// HTML 비교 정규화: 선행/후행 빈 문단(<div><br/></div>) 등 비의미적 차이 제거로 루프 방지
	const normalizeHtmlForCompare = (html: string): string => {
		if (!html) return "";
		return html
			.replace(/^(?:<div><br\s*\/?><\/div>)+/g, "")
			.replace(/(?:<div><br\s*\/?><\/div>)+$/g, "")
			.trim();
	};

	// 에디터 내부에서 클릭한(포커스가 간) 요소에 data-props가 있을 경우 세팅
	const [selectedRenderElement, setSelectedRenderElement] =
		useState<MetaFieldType | null>(null);
	// 툴바 버튼으로 생성한 요소의 ID
	const [lastInsertedId, setLastInsertedId] = useState<string | null>(null);

	const onUpdateDebounced = useMemo(
		() =>
			debounce(
				(ed: Editor) => {
					const rawHtml = ed.getHTML();
					const cmpHtml = normalizeHtmlForCompare(rawHtml);
					// console.log("getHtml:", rawHtml);

					if (cmpHtml !== lastContentRef.current) {
						lastContentRef.current = cmpHtml;
						onChange({
							target: {name, value: rawHtml},
						} as FakeInputEvent);
					}

					// DOM 전역 말고 에디터 DOM만 스캔 (범위 축소)
					const idsInEditor = Array.from(
						ed.view.dom.querySelectorAll("[data-id]")
					)
						.map((el) => (el as Element).getAttribute("data-id"))
						.filter((id): id is string => id !== null);

					// 실제로 변경이 있을 때만 setFields 호출
					const currentIds = fields
						.map((f) => f.id)
						.filter((id): id is string => Boolean(id));
					const hasChanges =
						idsInEditor.length !== currentIds.length ||
						idsInEditor.some((id) => !currentIds.includes(id)) ||
						currentIds.some((id) => !idsInEditor.includes(id));

					if (hasChanges) {
						setFields((prev) =>
							prev.filter((f) =>
								f.id ? idsInEditor.includes(f.id) : f
							)
						);
					}
				},
				100, // 150 -> 100으로 단축
				{maxWait: 200} // 400 -> 200으로 단축
			),
		[name, onChange]
	);

	const onSelUpdateDebounced = useMemo(
		() =>
			debounce((ed: Editor) => {
				const {$from} = ed.state.selection;
				const domAtPos = ed.view.domAtPos($from.pos);
				let target = (domAtPos.node as Element) ?? null;

				if (target?.tagName === "DIV") {
					const selectedOuterSpan = target.querySelector(
						"span.ProseMirror-selectednode"
					);
					const idSpan = selectedOuterSpan?.querySelector(
						"span[data-generated-element][data-id]"
					);
					if (idSpan) target = idSpan as Element;
				}

				const dataId = target?.getAttribute?.("data-id") || "";
				if (!dataId) {
					setSelectedRenderElement(initialMetaField);
					return;
				}

				const f = fields.find((f) => f.id === dataId);
				if (f?.id) {
					setSelectedRenderElement({
						tagName: f.tagName,
						type: f.type,
						name: f.name,
						value: f.value,
						options: f.options,
						id: f.id,
						width: f.width,
						placeholder: f.placeholder,
						isRequired: f.isRequired,
					});
				}
			}, 50),
		[fields]
	);

	useEffect(() => () => onUpdateDebounced.cancel(), [onUpdateDebounced]);
	useEffect(
		() => () => onSelUpdateDebounced.cancel(),
		[onSelUpdateDebounced]
	);

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
			TableAttrsToDOM,
			TableAlign.configure({
				resizable: true,
				allowTableNodeSelection: true,
				cellMinWidth: 40,
			}),
			TableRow.configure({}),
			TableHeader,
			TableCellAttr,
			RowResize,
			ImageDragDrop,
			ResizableImage,
			RenderElement,
			RemoveHideSelection,
			InlineData,
		],
		editorProps: {
			// 붙여넣기 경로도 그대로 통과 (필요시 가공 넣어도 됨)
			transformPastedHTML: (html) => html,
		},
		content: "",
		// 새 인스턴스에서도 즉시 편집 가능하도록 즉시 렌더 유지
		immediatelyRender: true,
		onUpdate: ({editor}) => onUpdateDebounced(editor),
		onSelectionUpdate: ({editor}) => onSelUpdateDebounced(editor),
	});

	useEffect(() => {
		if (!lastInsertedId || !editor) return;

		// DOM에서 해당 id를 가진 요소를 찾음
		const el = document.querySelector(`[data-id="${lastInsertedId}"]`);
		if (!el) return;

		// 이미 해당 ID가 fields에 있는지 확인
		const existingFieldIndex = fields.findIndex(
			(f) => f.id === lastInsertedId
		);

		const newFieldData: MetaFieldType = {
			...initialMetaField,
			tagName: el?.tagName?.toLowerCase(),
			type: el?.getAttribute("data-element-type") || "",
			id: el?.getAttribute("data-id") || "",
			name: el?.getAttribute("name") || "",
			value: el?.getAttribute("data-id") || "",
			options: el?.getAttribute("options") || "",
			width: el?.getAttribute("width") || "",
			placeholder: el?.getAttribute("placeholder") || "",
			isRequired: el?.getAttribute("isRequired") === "true",
		};

		if (existingFieldIndex >= 0) {
			// 기존 필드가 있으면 업데이트 (DOM 속성이 변경되었을 수 있음)
			setFields((prevFields) =>
				prevFields.map((field, index) =>
					index === existingFieldIndex ? newFieldData : field
				)
			);
		} else {
			// 새 필드 추가
			setFields((prevFields) => [...prevFields, newFieldData]);
		}

		// 요소 삽입 직후 즉시 콘텐츠 업데이트 트리거
		setTimeout(() => {
			const newContent = editor.getHTML();

			if (newContent !== lastContentRef.current) {
				lastContentRef.current = newContent;
				onChange({
					target: {name, value: newContent},
				} as FakeInputEvent);
			}

			// 처리 완료 후 lastInsertedId 초기화로 재실행 방지
			setLastInsertedId(null);
		}, 10); // 짧은 지연으로 DOM 업데이트 완료 보장
	}, [lastInsertedId, editor, name, onChange]);

	useEffect(() => () => onUpdateDebounced.cancel(), [onUpdateDebounced]);
	const didInitRef = useRef(false);

	useEffect(() => {
		if (!editor) return;

		// ① 최초 1회만 초기 콘텐츠 주입
		if (!didInitRef.current && typeof value === "string") {
			editor.commands.setContent(value || "");
			lastContentRef.current = value || "";
			didInitRef.current = true;
			return;
		}

		// ② 외부 갱신만 반영 (내부 타이핑은 lastContentRef가 같아서 스킵)
		if (typeof value === "string" && value !== lastContentRef.current) {
			editor.commands.setContent(value);
			lastContentRef.current = value;
		}
	}, [editor, value]);

	const onChangeTargetElement = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const {name, value} = e.target;

		setSelectedRenderElement((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				[name]: value,
			};
		});

		// 속성 영역에서 수정한 객체 -> fields에 반영
		setFields((prev: MetaFieldType[]) =>
			prev.map((f: MetaFieldType) =>
				f.id === selectedRenderElement?.id ? {...f, [name]: value} : f
			)
		);
	};

	return (
		<section className={styles.container}>
			<FormEditorToolbar
				editor={editor}
				setLastInsertedId={setLastInsertedId}
			/>
			<div className={styles.wrapper}>
				<div className={styles.editor}>
					<EditorContent editor={editor} className={styles.content} />
				</div>
				<div className={styles.attrSection}>
					{isNotEmpty(selectedRenderElement?.id) ? (
						<>
							<span className={styles.subTextBlack}>
								선택된 요소 속성
							</span>
							<Divider type="middle" look="dashed" />

							<InputBasic
								name="tagName"
								value={selectedRenderElement?.tagName}
								label="tag"
								onChange={onChangeTargetElement}
								allowNegative
								readOnly
							></InputBasic>
							<InputBasic
								name="type"
								value={selectedRenderElement?.type}
								label="type"
								onChange={onChangeTargetElement}
								allowNegative
							></InputBasic>
							<InputBasic
								name="name"
								value={selectedRenderElement?.name}
								label="name"
								placeholder="변경을 인지 가능하게 하는 고유 값"
								onChange={onChangeTargetElement}
								allowNegative
							></InputBasic>

							{selectedRenderElement?.type !== "input" &&
								selectedRenderElement?.type !== "date" &&
								selectedRenderElement?.type !== "emp" && (
									<InputTextArea
										componentType="grayBorder"
										name="options"
										value={selectedRenderElement?.options}
										label="options"
										placeholder="옵션 여러 개일 경우 개행으로 구분						"
										onChange={onChangeTargetElement}
									></InputTextArea>
								)}

							<InputBasic
								name="id"
								value={selectedRenderElement?.id}
								onChange={onChangeTargetElement}
								label="id"
								allowNegative
								readOnly
							></InputBasic>
							<InputBasic
								name="width"
								value={selectedRenderElement?.width}
								label="width(px)"
								onChange={onChangeTargetElement}
								allowNegative
							></InputBasic>
							<InputBasic
								name="placeholder"
								value={selectedRenderElement?.placeholder}
								label="placeholder"
								onChange={onChangeTargetElement}
								allowNegative
							></InputBasic>

							<Toggle
								name="isRequired"
								value={selectedRenderElement?.isRequired}
								label="필수"
								onChange={onChangeTargetElement}
							></Toggle>
						</>
					) : (
						<span className={styles.refText}>
							* 현재 필드 요소들:{" "}
							{fields.map((f) => f.id).join(", ")}
						</span>
					)}
				</div>
			</div>
			{/* </div> */}
		</section>
	);
}
