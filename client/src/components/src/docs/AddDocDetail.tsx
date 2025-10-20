"use client";
import styles from "./styles/AddDoc.module.scss";
import {usePathname, useRouter} from "next/navigation";
import {ChangeEvent, useCallback, useEffect, useState} from "react";

import {useDocsContext} from "@/context/DocsContext";
import {MetaFieldType} from "@/components/common/editor/etc/editor.type";
import {UserErpType} from "@/types/user.type";
import {DocStatusEnum} from "./etc/docs.type";
import {ProofUrlEnum} from "./etc/url.enum";
import {validateFormData} from "./etc/validate";

import {requestPost} from "@/util/api/api-service";
import {getLastUrl} from "@/util/common/last-url";
import AlertService from "@/services/alert.service";

import FormParser from "@/components/common/editor/FormParser";
import Divider from "@/components/common/segment/Divider";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import InputBasic from "@/components/common/form-properties/InputBasic";
import Toggle from "@/components/common/form-properties/Toggle";
import Dialog from "@/components/common/layout/Dialog";
import useDialog from "@/hooks/useDialog";
import DateTimePicker from "@/components/common/form-properties/DateTimePicker";

const formIdNmMap: Record<string, string> = {
	employment: "재직 증명서",
	career: "경력 증명서",
	leaving: "퇴직 증명서",
};

type ProofFinishType = DocStatusEnum.SUBMITTED | DocStatusEnum.CANCELED;

const proofFinishTypeMap: Record<ProofFinishType, string> = {
	[DocStatusEnum.SUBMITTED]: "신청",
	[DocStatusEnum.CANCELED]: "취소",
};

export default function AddDocDetail() {
	const {docState, docDispatch, form, setForm} = useDocsContext();
	const {doc} = docState;
	const [formFields, setFormFields] = useState<MetaFieldType[]>([]);
	const [formData, setFormData] = useState<Record<string, string>>({});
	const [metaFieldsData, setMetaFieldsData] =
		useState<Partial<UserErpType> | null>(null);

	const router = useRouter();
	const pathname = usePathname();
	const pathSegs = pathname.split("/");
	const [_, mainMenu] = pathSegs; // mainMenu: community

	const listUrl =
		getLastUrl() ||
		`/${mainMenu}/${ProofUrlEnum.PROOF}/${ProofUrlEnum.STATUS}/${ProofUrlEnum.STATUS_ALL}`;

	const {dialogConfig, openDialog, closeDialog, setDialogConfig} =
		useDialog();
	const [approvalOrRejection, setApprovalOrRejection] =
		useState<ProofFinishType>(DocStatusEnum.SUBMITTED);

	// FormParser에서 formData 변경사항을 받는 함수
	const handleFormDataChange = useCallback(
		(newFormData: Record<string, string>) => {
			setFormData((prevFormData) => {
				// 실제로 변경된 경우에만 업데이트
				if (
					JSON.stringify(prevFormData) !== JSON.stringify(newFormData)
				) {
					return newFormData;
				}
				return prevFormData;
			});
		},
		[]
	);

	const openAddingOpinionModal = (type: ProofFinishType) => {
		setApprovalOrRejection(type);

		// 필수 필드 유효성 검사
		const validationErrors = validateFormData(formFields, formData);
		if (validationErrors.length > 0) {
			AlertService.error(validationErrors.join("\n"));
			return;
		}

		openDialog();
	};

	// 최종 HTML 생성 함수
	const generateDocHtml = (): string => {
		let finalHtml = form?.templateHtml || "";

		// 1. formData의 값들로 render-element 태그들을 실제 값으로 치환 (사용자 입력값)
		Object.keys(formData).forEach((fieldId) => {
			const value = formData[fieldId];
			if (value) {
				// render-element를 실제 값으로 치환
				const regex = new RegExp(
					`<render-element[^>]*data-id="${fieldId}"[^>]*>[^<]*</render-element>`,
					"g"
				);
				finalHtml = finalHtml.replace(regex, value);

				// data-props 내부의 data-id도 찾아서 치환
				const propsRegex = new RegExp(
					`<render-element[^>]*data-props="[^"]*data-id[^"]*${fieldId}[^"]*"[^>]*>[^<]*</render-element>`,
					"g"
				);
				finalHtml = finalHtml.replace(propsRegex, value);
			}
		});

		// 2. metaFieldsData(ERP 정보)로 ##필드명## 패턴의 render-element 치환
		if (metaFieldsData) {
			Object.keys(metaFieldsData).forEach((erpFieldName) => {
				const erpValue =
					metaFieldsData[erpFieldName as keyof UserErpType];
				if (erpValue) {
					// ##필드명##-ID 패턴으로 된 data-id를 찾아서 치환
					const erpRegex = new RegExp(
						`<render-element[^>]*data-id="##${erpFieldName}##[^"]*"[^>]*>[^<]*</render-element>`,
						"g"
					);
					finalHtml = finalHtml.replace(erpRegex, String(erpValue));

					// data-props 내부의 ##필드명## 패턴도 치환
					const erpPropsRegex = new RegExp(
						`<render-element[^>]*data-props="[^"]*##${erpFieldName}##[^"]*"[^>]*>[^<]*</render-element>`,
						"g"
					);
					finalHtml = finalHtml.replace(
						erpPropsRegex,
						String(erpValue)
					);
				}
			});
		}

		return finalHtml;
	};

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

	async function getProofForm() {
		const res = await requestPost("/docs/getProofForm", {
			formId: doc.formId,
		});
		if (res.statusCode === 200) {
			AlertService.success("성공");
			setForm(res.data.form);
			setFormFields(res.data.fields);
			setMetaFieldsData(res.data.user || null);
		}
	}

	useEffect(() => {
		if (doc.formId) {
			getProofForm();

			// 컴포넌트 초기 렌더링 시 formId에 따른 docNm 설정
			docDispatch({
				type: "UPDATE_DOC_FIELD",
				payload: {
					name: "docNm" as keyof typeof doc,
					value: doc.docNm,
				},
			});
		}
	}, [doc.formId]);

	const onSubmit = async () => {
		// 최종 HTML 생성
		const docHtml = generateDocHtml();
		docDispatch({
			type: "UPDATE_DOC_FIELD",
			payload: {name: "docHtml", value: docHtml},
		});

		const res = await requestPost("/docs/createOrUpdateProof", {
			...doc,
			docHtml: docHtml,
			reviewerId: form?.managerId || null,
			status: form?.approvalRequired
				? DocStatusEnum.SUBMITTED
				: DocStatusEnum.APPROVED,
			reviewedAt: form?.approvalRequired ? null : new Date(),
		});
		if (res.statusCode === 200) {
			AlertService.success("제증명 신청이 완료되었습니다.");
			router.push(listUrl);
			docDispatch({type: "RESET"});
		}
	};

	const onCancel = () => {
		router.push(listUrl);
	};

	return (
		<>
			<div className={styles.form}>
				<div className={styles.row}>
					<InputBasic
						label="제목"
						name="docNm"
						value={doc?.docNm}
						readOnly
					/>
				</div>

				<div className={styles.row}>
					<Toggle
						name="isUrgent"
						label="긴급"
						value={doc?.isUrgent}
						onChange={onChangeDoc}
					/>
				</div>
				<div className={styles.row}>
					<Toggle
						name="isTempSaved"
						label="임시저장"
						value={doc?.isTempSaved}
						onChange={onChangeDoc}
					/>
				</div>
				<div className={styles.row}>
					<Toggle
						name="isScheduled"
						label="예약"
						value={doc?.isScheduled}
						onChange={onChangeDoc}
					/>
				</div>
				{doc?.isScheduled && (
					<div className={styles.row}>
						<DateTimePicker
							initDate={doc?.scheduledAt}
							initDateNm="scheduledAt"
							onChange={onChangeDoc}
						/>
					</div>
				)}

				<Divider type="middle" look="dashed" />

				<FormParser
					htmlString={form?.templateHtml}
					formFields={formFields}
					metaFieldsData={metaFieldsData}
					onFormDataChange={handleFormDataChange}
				/>

				<CommonButtonGroup
					usedButtons={{
						btnList: true,
						btnTempSave: true,
						btnCancel: true,
						btnSubmit: true,
					}}
					onCancel={() =>
						openAddingOpinionModal(DocStatusEnum.CANCELED)
					}
					onSubmit={() =>
						openAddingOpinionModal(DocStatusEnum.SUBMITTED)
					}
					listUrl={listUrl}
				></CommonButtonGroup>
			</div>

			<Dialog
				dialogConfig={dialogConfig}
				dialogTitle={`${proofFinishTypeMap[approvalOrRejection]} 확인`}
				closeDialog={closeDialog}
				confirmDialog={
					approvalOrRejection === DocStatusEnum.SUBMITTED
						? onSubmit
						: onCancel
				}
				confirmText="확인"
				cancelText="취소"
				width="30rem"
				height="auto"
			>
				{`${proofFinishTypeMap[approvalOrRejection]}하시겠습니까?`}
			</Dialog>
		</>
	);
}
