"use client";
import React from "react";
import {Level} from "@tiptap/extension-heading";

import Tooltip from "../../segment/Tooltip";
import {headingOpts} from "../etc/options";

type Props = {
	editor?: any;
};

export default function Heading({editor}: Props) {
	const handleSelectHeading = (heading: Level | 0) => {
		if (heading === 0) {
			// 일반 텍스트로 변환
			editor.chain().focus().setParagraph().run();
		} else {
			// 헤딩 적용
			editor.chain().focus().toggleHeading({level: heading}).run();
		}
	};

	// 현재 활성화된 헤딩 레벨 찾기
	const getCurrentHeadingLevel = () => {
		for (let level = 1; level <= 6; level++) {
			if (editor.isActive("heading", {level})) {
				return level.toString();
			}
		}
		return ""; // 헤딩이 아닌 경우
	};

	return (
		<Tooltip text="헤딩">
			<select
				onChange={(e) => {
					const value = e.target.value;
					if (value === "0") {
						handleSelectHeading(0);
					} else {
						const level = parseInt(value) as Level;
						if (level) {
							handleSelectHeading(level);
						}
					}
				}}
				value={getCurrentHeadingLevel()} // 현재 헤딩 레벨 표시
			>
				<option value="" disabled>
					제목
				</option>
				<option value="0">일반 텍스트</option>
				{headingOpts.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</Tooltip>
	);
}
