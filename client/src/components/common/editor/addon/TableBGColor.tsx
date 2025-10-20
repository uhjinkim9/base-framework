"use client";
import React from "react";
import Tooltip from "../../segment/Tooltip";

type Props = {
	editor?: any;
};

export default function TableBGColor({editor}: Props) {
	return (
		<>
			<Tooltip text="셀 배경색">
				<input
					type="color"
					onChange={(e) =>
						editor
							.chain()
							.focus()
							.setCellAttribute("backgroundColor", e.target.value)
							.run()
					}
				/>
			</Tooltip>
		</>
	);
}
