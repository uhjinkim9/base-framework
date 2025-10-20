import React, {createElement} from "react";
import {Node, mergeAttributes} from "@tiptap/core";
import {ReactNodeViewRenderer, NodeViewWrapper} from "@tiptap/react";

/**
 * @fileoverview RenderElement 모듈 - Tiptap 에디터에서 사용자 정의 렌더링 요소를 처리하는 서비스
 * @module RenderElement
 * @description 이 모듈은 FormEditor.tsx 컴포넌트의 Tiptap 에디터에서 사용자 정의 렌더링 요소를 처리하는 역할을 한다.
 *
 * @author 김어진
 * @updated 2025-08-22
 */

const defaultComponent = (elementType: string, props: any) => {
	const dataId = props["data-id"];
	return createElement("span", {
		key: elementType, // "check"
		children: elementType,
		"data-generated-element": "true",
		"data-element-type": elementType,
		"data-id": dataId,
		value: dataId,
	});
};

// React 컴포넌트로 노드 렌더링
// 에디터에서 renderElement 노드가 나타나면, Tiptap은 이걸 RenderElementComponent를 사용해서 화면에 그려줌
const RenderElementComponent = ({
	node,
	updateAttributes,
	getPos,
	editor,
}: {
	node: any;
	updateAttributes: (attrs: any) => void;
	getPos: () => number;
	editor: any;
}) => {
	const {elementType, props = {}} = node.attrs;
	const element = defaultComponent(elementType, props);
	return createElement(NodeViewWrapper, {as: "span"}, element);
};

const RenderElement = Node.create({
	name: "renderElement",
	group: "inline",
	inline: true,
	atom: true,
	// addNodeView: Tiptap 노드가 실제로 에디터 화면에 어떻게 보여질지 정의
	addNodeView() {
		// ReactNodeViewRenderer: RenderElementComponent를 React 컴포넌트로 만들어서 이 노드에 대한 UI를 React로 렌더링하도록 연결
		return ReactNodeViewRenderer(RenderElementComponent);
	},

	addAttributes() {
		return {
			elementType: {
				default: "input",
				parseHTML: (element: any) =>
					element.getAttribute("data-element-type"),
				renderHTML: (attributes: any) => {
					if (!attributes.elementType) {
						return {};
					}
					return {
						"data-element-type": attributes.elementType,
					};
				},
			},
			props: {
				default: {},
				// parseHTML: 에디터에 외부 HTML을 붙여넣거나 로드할 때, 어떤 HTML 태그를 이 RenderElement 노드로 인식할지 정의
				parseHTML: (element: any) => {
					try {
						return JSON.parse(
							element.getAttribute("data-props") || "{}"
						);
					} catch {
						return {};
					}
				},
				// renderHTML: 에디터에서 이 RenderElement 노드가 어떻게 HTML로 변환될지 정의
				// JavaScript 객체인 props를 JSON 문자열로 변환해서 HTML data-props 속성으로 만들어줌
				// HTML로 저장하거나 에디터 외부로 내보낼 때 (예: 데이터베이스 저장, 웹페이지에 표시) 이 노드를 어떤 HTML 태그로 변환할지 정의
				renderHTML: (attributes: any) => {
					return {
						"data-props": JSON.stringify(attributes.props || {}),
					};
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "render-element",
			},
		];
	},

	renderHTML({HTMLAttributes}: any) {
		return ["render-element", mergeAttributes(HTMLAttributes)];
	},

	// addCommands: 이 노드를 에디터에 삽입할 수 있는 '커맨드(명령어)'를 정의
	// 이 커맨드를 사용하면 사용자가 버튼 클릭 등으로 에디터에 이 RenderElement 노드를 쉽게 삽입할 수 있음
	addCommands() {
		return {
			insertRenderElement:
				(options: {elementType: string; id: string; props?: any}) =>
				({commands}: any) => {
					return commands.insertContent({
						type: this.name,
						attrs: {
							elementType: options.elementType,
							id: options.id,
							props: options.props || {},
						},
					});
				},
		};
	},
});

export default RenderElement;
