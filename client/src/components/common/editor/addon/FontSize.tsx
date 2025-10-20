"use client";
import React from "react";

import Tooltip from "../../segment/Tooltip";
import {fontSizeOpts} from "../etc/options";

type Props = {
	editor?: any;
};

export default function FontSize({editor}: Props) {
	return (
		<Tooltip text="글자 크기">
			<select
				onChange={(e) => {
					const size = e.target.value;
					editor?.chain().focus().setFontSize(size).run();
				}}
			>
				<option value="" disabled>
					크기
				</option>
				{fontSizeOpts.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</Tooltip>
	);
}
