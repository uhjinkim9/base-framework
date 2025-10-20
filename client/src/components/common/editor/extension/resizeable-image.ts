import {Node, mergeAttributes} from "@tiptap/core";
import {ReactNodeViewRenderer} from "@tiptap/react";
import ImageComponent from "../parts/ResizableImageComponent";

export const ResizableImage = Node.create({
	name: "image",
	group: "inline", // 블록이 아닌 인라인 요소로 작동
	inline: true, // 줄바꿈 없이 텍스트처럼 렌더링
	draggable: true,
	selectable: true,

	// 노드가 가질 수 있는 속성 정의
	addAttributes() {
		return {
			src: {default: null}, // 이미지 경로
			width: {default: "auto"},
			height: {default: "auto"},
		};
	},

	parseHTML() {
		return [
			{
				tag: "img[src]",
			},
		];
	},

	// 에디터가 HTML에서 <img> 태그를 만나면 이 노드로 변환
	renderHTML({HTMLAttributes}) {
		return ["img", mergeAttributes(HTMLAttributes)];
	},

	// 기존 <img> 대신, ImageComponent를 NodeView로 사용
	addNodeView() {
		return ReactNodeViewRenderer(ImageComponent);
	},
});
