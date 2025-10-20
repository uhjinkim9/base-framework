"use client";
import React from "react";

import Tooltip from "../../segment/Tooltip";
import {
	LuBold,
	LuItalic,
	LuUnderline,
	LuStrikethrough,
	LuHighlighter,
	LuSubscript,
	LuSuperscript,
} from "react-icons/lu";

type Props = {
	editor?: any;
};

export default function FontStyle({editor}: Props) {
	return (
		<>
			<Tooltip text="굵게">
				<button
					onClick={() => editor.chain().focus().toggleBold().run()}
				>
					<LuBold />
				</button>
			</Tooltip>
			<Tooltip text="기울임">
				<button
					onClick={() => editor.chain().focus().toggleItalic().run()}
				>
					<LuItalic />
				</button>
			</Tooltip>
			<Tooltip text="밑줄">
				<button
					onClick={() =>
						editor.chain().focus().toggleUnderline().run()
					}
					className={editor.isActive("underline") ? "is-active" : ""}
				>
					<LuUnderline />
				</button>
			</Tooltip>
			<Tooltip text="취소선">
				<button
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={editor.isActive("strike") ? "is-active" : ""}
				>
					<LuStrikethrough />
				</button>
			</Tooltip>
			<Tooltip text="형광펜">
				<button
					onClick={() =>
						editor.commands.toggleHighlight({
							color: "rgba(255, 184, 134, 0.9)",
						})
					}
				>
					<LuHighlighter />
				</button>
			</Tooltip>
			<Tooltip text="아래첨자">
				<button
					onClick={() =>
						editor.chain().focus().toggleSubscript().run()
					}
					className={editor.isActive("subscript") ? "is-active" : ""}
				>
					<LuSubscript />
				</button>
			</Tooltip>
			<Tooltip text="윗첨자">
				<button
					onClick={() =>
						editor.chain().focus().toggleSuperscript().run()
					}
					className={
						editor.isActive("superscript") ? "is-active" : ""
					}
				>
					<LuSuperscript />
				</button>
			</Tooltip>

			<Tooltip text="글자 색상">
				<input
					type="color"
					onChange={(e) =>
						editor.chain().focus().setColor(e.target.value).run()
					}
				/>
			</Tooltip>
		</>
	);
}
