"use client";
import styles from "../styles/ResizeableImageComponent.module.scss";
import "react-resizable/css/styles.css";

import {NodeViewWrapper} from "@tiptap/react";
import {ResizableBox} from "react-resizable"; // 리사이즈 핸들 달린 박스 만들 수 있음

export default function ResizableImageComponent({
	node,
	updateAttributes,
}: {
	node: any;
	updateAttributes: (attrs: any) => void;
}) {
	const {src, width, height} = node.attrs;

	return (
		<NodeViewWrapper as="div" className={styles.resizableImageWrapper}>
			{/* 사이즈 조정 가능한 컴포넌트 */}
			<ResizableBox
				width={parseInt(width) || 300}
				height={parseInt(height) || 200}
				lockAspectRatio={true}
				resizeHandles={["se"]}
				// 사이즈 조절 끝났을 때 실행되는 콜백
				onResizeStop={(e, data) => {
					updateAttributes({
						width: data.size.width,
						height: data.size.height,
					});
				}}
				style={{
					overflow: "hidden", // 스크롤 없애기
				}}
			>
				<img
					src={src}
					style={{
						width: "100%",
						height: "100%",
						objectFit: "contain",
					}}
				/>
			</ResizableBox>
		</NodeViewWrapper>
	);
}
