"use client";
import styles from "../styles/Toolbar.module.scss";
import clsx from "clsx";
import {Editor} from "@tiptap/react";

type Props = {
	editor: Editor | null;
	setLastInsertedId?: (id: string | null) => void;
};

import Heading from "../addon/Heading";
import FontSize from "../addon/FontSize";
import FontStyle from "../addon/FontStyle";
import ParagraphStyle from "../addon/ParagraphStyle";
import TableLayout from "../addon/TableLayout";
import TableBGColor from "../addon/TableBGColor";
import TableRowHeight from "../addon/TableRowHeight";
import TableAlign from "../addon/TableAlign";

export default function TextEditorToolbar({editor}: Props) {
	if (!editor) return null;

	return (
		<div className={styles.wrapper}>
			<div className={styles.toolbar}>
				<div className={clsx(styles.row, styles.smallGap)}>
					<Heading editor={editor} />
					<FontSize editor={editor} />
					<FontStyle editor={editor} />
				</div>

				<div className={clsx(styles.row, styles.smallGap)}>
					<ParagraphStyle editor={editor} />
				</div>

				<div className={clsx(styles.row, styles.smallGap)}>
					<TableLayout editor={editor} />
					<TableBGColor editor={editor} />
				</div>
				<div className={clsx(styles.row, styles.smallGap)}>
					<TableAlign editor={editor} />
				</div>
				<div className={clsx(styles.row, styles.smallGap)}>
					<TableRowHeight editor={editor} />
				</div>
			</div>
		</div>
	);
}
