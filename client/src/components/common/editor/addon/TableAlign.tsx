"use client";
import React from "react";
import type {ChainedCommands, SingleCommands} from "@tiptap/core";
import {
	LuAlignLeft,
	LuAlignCenter,
	LuAlignRight,
	LuTable,
} from "react-icons/lu";
import Tooltip from "../../segment/Tooltip";

type TableAlign = "left" | "center" | "right";

type Props = {
	editor?: any;
};

// 체인에 setTableAlign만 살짝 보강한 타입
type ChainedWithTableAlign = ChainedCommands & {
	setTableAlign: (alignment: TableAlign) => ChainedCommands;
};

// 싱글 커맨드도 필요하면 보강
type SingleWithTableAlign = SingleCommands & {
	setTableAlign: (alignment: TableAlign) => boolean;
};

export default function TableAlign({editor}: Props) {
	// 테이블 정렬 함수
	const setTableAlignment = (alignment: TableAlign) => {
		const chain = editor?.chain().focus() as ChainedWithTableAlign;
		chain.setTableAlign(alignment).run();

		const {selection} = editor.state;
		const {$from} = selection;

		// DOM에서 현재 커서 위치의 요소 찾기
		const domAtPos = editor.view.domAtPos($from.pos);
		let currentElement = domAtPos.node as Element;

		// 부모 요소들을 탐색하여 table 찾기
		while (currentElement && currentElement !== editor.view.dom) {
			if (currentElement.tagName === "TABLE") {
				// 기존 정렬 클래스 제거 후 새 클래스 추가
				currentElement.className =
					currentElement.className.replace(/table-align-\w+/g, "") +
					` table-align-${alignment}`;

				// 스타일 적용
				const htmlElement = currentElement as HTMLElement;
				switch (alignment) {
					case "left":
						htmlElement.style.marginLeft = "0";
						htmlElement.style.marginRight = "auto";
						break;
					case "center":
						htmlElement.style.marginLeft = "auto";
						htmlElement.style.marginRight = "auto";
						break;
					case "right":
						htmlElement.style.marginLeft = "auto";
						htmlElement.style.marginRight = "0";
						break;
				}
				break;
			}
			currentElement = currentElement.parentElement as Element;
		}
	};

	return (
		<>
			<Tooltip text="표 왼쪽 정렬">
				<button onClick={() => setTableAlignment("left")}>
					<LuTable />
					<LuAlignLeft />
				</button>
			</Tooltip>

			<Tooltip text="표 가운데 정렬">
				<button onClick={() => setTableAlignment("center")}>
					<LuTable />
					<LuAlignCenter />
				</button>
			</Tooltip>

			<Tooltip text="표 오른쪽 정렬">
				<button onClick={() => setTableAlignment("right")}>
					<LuTable />
					<LuAlignRight />
				</button>
			</Tooltip>
		</>
	);
}
