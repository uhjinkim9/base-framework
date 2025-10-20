"use client";
import React from "react";

import Tooltip from "../../segment/Tooltip";
import {
	LuAlignLeft,
	LuAlignCenter,
	LuAlignRight,
	LuList,
	LuListOrdered,
	LuIndentIncrease,
} from "react-icons/lu";

type Props = {
	editor?: any;
};

export default function ParagraphStyle({editor}: Props) {
	return (
		<>
			<Tooltip text="왼쪽 정렬">
				<button
					onClick={() =>
						editor.chain().focus().setTextAlign("left").run()
					}
					className={
						editor.isActive({textAlign: "left"}) ? "is-active" : ""
					}
				>
					<LuAlignLeft />
				</button>
			</Tooltip>
			<Tooltip text="가운데 정렬">
				<button
					onClick={() =>
						editor.chain().focus().setTextAlign("center").run()
					}
					className={
						editor.isActive({textAlign: "center"})
							? "is-active"
							: ""
					}
				>
					<LuAlignCenter />
				</button>
			</Tooltip>
			<Tooltip text="오른쪽 정렬">
				<button
					onClick={() =>
						editor.chain().focus().setTextAlign("right").run()
					}
					className={
						editor.isActive({textAlign: "right"}) ? "is-active" : ""
					}
				>
					<LuAlignRight />
				</button>
			</Tooltip>
			<Tooltip text="순서 없는 글머리">
				<button
					onClick={() =>
						editor.chain().focus().toggleBulletList().run()
					}
				>
					<LuList />
				</button>
			</Tooltip>
			<Tooltip text="순서 있는 글머리">
				<button
					onClick={() =>
						editor.chain().focus().toggleOrderedList().run()
					}
				>
					<LuListOrdered />
				</button>
			</Tooltip>
			<Tooltip text="들여쓰기">
				<button
					onClick={() =>
						editor.chain().focus().toggleBlockquote().run()
					}
				>
					<LuIndentIncrease />
				</button>
			</Tooltip>
		</>
	);
}
