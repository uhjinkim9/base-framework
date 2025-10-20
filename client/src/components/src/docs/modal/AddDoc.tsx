"use client";
import styles from "../styles/AddDoc.module.scss";
import {ChangeEvent} from "react";

import {useDocsContext} from "@/context/DocsContext";

import InputBasic from "@/components/common/form-properties/InputBasic";
import SelectBoxBasic from "@/components/common/form-properties/SelectBoxBasic";
import {generateNanoId} from "@/util/helpers/random-generator";

const formIdNmMap: Record<string, string> = {
	employment: "재직 증명서",
	career: "경력 증명서",
	leaving: "퇴직 증명서",
};

export default function AddDoc() {
	const {formKind, setFormKind, docState, docDispatch} = useDocsContext();
	const {doc} = docState;

	function onChangeDoc(
		e: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) {
		const {name, value} = e.target;
		const uniqueDocId = generateNanoId(8);

		// uniqueDocId를 사용하여 문서 ID 생성
		if (name === "formId") {
			docDispatch({
				type: "UPDATE_DOC_FIELD",
				payload: {
					name: "docNm" as keyof typeof doc,
					value: `${formIdNmMap[value]} 신청`,
				},
			});
			docDispatch({
				type: "UPDATE_DOC_FIELD",
				payload: {
					name: "docId" as keyof typeof doc,
					value: `${value}-${uniqueDocId}`,
				},
			});
		}
		docDispatch({
			type: "UPDATE_DOC_FIELD",
			payload: {name: name as keyof typeof doc, value: value},
		});
	}

	function onChangeFormKind(e: ChangeEvent<HTMLSelectElement>) {
		const {value} = e.target;
		setFormKind(value);
	}

	return (
		<>
			<div className={styles.form}>
				<div className={styles.row}>
					<div className={styles.col}>
						<SelectBoxBasic
							label="종류"
							defaultLabel="종류"
							value={formKind}
							onChange={onChangeFormKind}
							codeClass="kind-of-doc"
							width="8rem"
						/>
					</div>
				</div>

				<div className={styles.row}>
					<div className={styles.col}>
						<SelectBoxBasic
							label="구분"
							defaultLabel="증명서"
							name="formId"
							value={doc?.formId}
							onChange={onChangeDoc}
							codeClass={formKind}
							width="8rem"
						/>
					</div>
				</div>

				<div className={styles.row}>
					<div className={styles.col}>
						<InputBasic
							name="docNm"
							label="제목"
							placeholder="문서 제목"
							value={doc?.docNm}
							onChange={onChangeDoc}
							width="100%"
						/>
					</div>
				</div>
			</div>
		</>
	);
}
