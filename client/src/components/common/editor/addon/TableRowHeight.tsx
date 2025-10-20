"use client";
import React, {useMemo, useState} from "react";

type Props = {
	editor?: any;
};

export default function TableRowHeight({editor}: Props) {
	const [height, setHeight] = useState<number>(32);
	const canTable = !!editor;

	const currentHeight = useMemo(() => {
		try {
			const el = document.querySelector(
				"td.is-selected, th.is-selected"
			) as HTMLElement | null;
			const h =
				el?.getAttribute?.("data-row-height") ||
				el?.style?.height ||
				"";
			if (!h) return "";
			const n = parseInt(h, 10);
			return Number.isFinite(n) ? String(n) : "";
		} catch {
			return "";
		}
	}, [editor?.state?.selection?.toJSON?.()]);

	const applyHeight = (n: number) =>
		editor?.chain().focus().setRowHeight?.(n).run();
	const unsetHeight = () => editor?.chain().focus().unsetRowHeight?.().run();

	return (
		<div style={{display: "flex", gap: 8, alignItems: "center"}}>
			<div style={{display: "inline-flex", gap: 6, alignItems: "center"}}>
				<span style={{opacity: 0.8}}>행 높이(px)</span>
				<input
					type="number"
					min={12}
					step={2}
					value={height}
					onChange={(e) =>
						setHeight(parseInt(e.target.value || "0", 10) || 12)
					}
					style={{width: 72}}
				/>
				<button
					type="button"
					disabled={!canTable}
					onClick={() => applyHeight(height)}
				>
					적용
				</button>
				<button
					type="button"
					disabled={!canTable}
					onClick={() => unsetHeight()}
				>
					초기화
				</button>
				<span style={{fontSize: 12, opacity: 0.7}}>
					현재: {currentHeight || "-"}
				</span>
			</div>
		</div>
	);
}
