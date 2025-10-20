"use client";
import styles from "../styles/AddDoc.module.scss";
import {ChangeEvent} from "react";

import {useDocsContext} from "@/context/DocsContext";

import InputTextArea from "@/components/common/form-properties/InputTextArea";

export default function AddOpinion() {
	const {docState, docDispatch} = useDocsContext();
	const {doc} = docState;

	function onChangeDoc(
		e: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) {
		const {name, value} = e.target;

		docDispatch({
			type: "UPDATE_DOC_FIELD",
			payload: {name: name as keyof typeof doc, value: value},
		});
	}

	return (
		<>
			<div className={styles.form}>
				<div className={styles.col}>
					<InputTextArea
						name="reviewComment"
						label="의견"
						value={doc?.reviewComment}
						onChange={onChangeDoc}
						width="100%"
					/>
				</div>
			</div>
		</>
	);
}
