"use client";
import styles from "../styles/AddMenu.module.scss";
import {ChangeEvent, useEffect, useState} from "react";
import {useRouter} from "next/navigation";

import {useAdminContext} from "@/context/AdminContext";
import {FormType} from "../../docs/etc/docs.type";
import {ProofUrlEnum} from "../../docs/etc/url.enum";
import {newFormState} from "../etc/initial-state";
import {validateForm} from "../etc/validate";
import {requestPost} from "@/util/api/api-service";
import AlertService from "@/services/alert.service";

import InputBasic from "@/components/common/form-properties/InputBasic";
import Toggle from "@/components/common/form-properties/Toggle";
import OrgTreeSelect from "@/components/common/company-related/OrgTreeSelect";
import Divider from "@/components/common/segment/Divider";
import FormEditor from "@/components/common/editor/FormEditor";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import useModal from "@/hooks/useModal";
import Modal from "@/components/common/layout/Modal";
import FormParser from "@/components/common/editor/FormParser";

export default function AddForm() {
	const router = useRouter();
	const {openModal, closeModal, modalConfig} = useModal();
	const {mode, setMode, form, setForm, fields, setFields} = useAdminContext();

	function onChangeForm(e: ChangeEvent<any>) {
		const {name, value} = e.target;
		setForm((prev: FormType) => {
			if (name === "orgSelected") {
				return {...prev, managerId: value.userIds[0]};
			}
			return {...prev, [name]: value};
		});
	}

	useEffect(() => {
		console.log("form", form);
	}, [form]);

	async function createOrUpdateForm() {
		const validationCheck = validateForm(form);
		if (!validationCheck) return;
		const res = await requestPost("/docs/createOrUpdateForm", {
			form: form,
			fields: fields,
		});
		if (res.statusCode === 200) {
			router.push(`./${ProofUrlEnum.LIST}`);
			// 입력 상태 초기화
			setMode("view");
			setForm(() => newFormState());
			setFields([]);
			AlertService.success(
				`양식이 ${mode === "edit" ? "수정" : "등록"}되었습니다.`
			);
		} else {
			AlertService.error(
				`양식이 ${mode === "edit" ? "수정" : "등록"}되지 않았습니다.`
			);
		}
	}

	async function onCancel() {
		setForm(() => newFormState());
		setFields([]);
		setMode("view");
		router.back();
	}

	const showPreview = () => {
		openModal();
	};

	return (
		<>
			<span className={styles.mainText}>
				{mode === "edit" ? "제증명 서식 수정" : "제증명 서식 추가"}
			</span>
			<Divider type="middle" look="dashed" />
			<div className={styles.col}>
				<InputBasic
					placeholder="등록 시 수정 불가"
					type="text"
					label="양식 ID"
					onChange={onChangeForm}
					name="formId"
					value={form?.formId}
					width="90%"
					allowNegative
					readOnly={mode === "edit"}
				></InputBasic>
			</div>
			<div className={styles.row}>
				<InputBasic
					label="양식명"
					onChange={onChangeForm}
					name="formNm"
					value={form?.formNm}
					width="90%"
					allowNegative
				></InputBasic>
			</div>

			<div className={styles.row}>
				<InputBasic
					label="설명"
					onChange={onChangeForm}
					name="explanation"
					value={form?.explanation}
					width="90%"
					allowNegative
				></InputBasic>
			</div>

			<div className={styles.row}>
				<OrgTreeSelect
					label="담당자"
					onChange={onChangeForm}
					multi={false}
					value={{
						joinUserId: form?.managerId,
						joinDeptCd: null,
					}}
					width="90%"
					placeHolder="성명 + Enter"
				/>
			</div>

			<div className={styles.row}>
				<Toggle
					name="isUsed"
					value={form?.isUsed}
					label="사용 여부"
					onChange={onChangeForm}
				></Toggle>
			</div>
			<div className={styles.row}>
				<Toggle
					name="approvalRequired"
					value={form?.approvalRequired}
					label="승인 필요 여부"
					onChange={onChangeForm}
				></Toggle>
			</div>

			<Divider type="none" />

			<FormEditor
				name="templateHtml"
				value={form?.templateHtml}
				onChange={onChangeForm}
				etc={{mode: mode}}
				fields={fields}
				setFields={setFields}
			/>

			{/* <FileDrop
				setFileIndexes={setFileIndexes}
				fileIdxes={form?.fileIdxes}
			/> */}
			<Divider type="none" />

			<CommonButtonGroup
				usedButtons={{
					btnSubmit: true,
					btnCancel: true,
					btnTempSave: true,
					btnPreview: true,
				}}
				onSubmit={createOrUpdateForm}
				onCancel={onCancel}
				onShowPreview={showPreview}
			></CommonButtonGroup>

			<Modal
				modalConfig={modalConfig}
				closeModal={closeModal}
				modalTitle={"양식 미리보기"}
				footerContent={
					<CommonButtonGroup
						usedButtons={{btnCancel: true}}
						cancelBtnLabel="닫기"
						onCancel={closeModal}
					/>
				}
			>
				<FormParser htmlString={form?.templateHtml} isExample />
			</Modal>
		</>
	);
}
