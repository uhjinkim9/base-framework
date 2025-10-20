"use client";
import styles from "./styles/AddDoc.module.scss";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";

import {useDocsContext} from "@/context/DocsContext";
import {ProofUrlEnum} from "./etc/url.enum";
import {DocStatusEnum} from "./etc/docs.type";
import {GoCircle, GoXCircle} from "react-icons/go";

import {requestPost} from "@/util/api/api-service";
import {getLastUrl} from "@/util/common/last-url";
import AlertService from "@/services/alert.service";

import Divider from "@/components/common/segment/Divider";
import FormParser from "@/components/common/editor/FormParser";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import Modal from "@/components/common/layout/Modal";
import useModal from "@/hooks/useModal";
import AddOpinion from "./modal/AddOpinion";
import {useUserContext} from "@/context/UserContext";
import {fullDateTimeWithLabel} from "@/util/helpers/formatters";

type ProofFinishType =
	| DocStatusEnum.APPROVED
	| DocStatusEnum.REJECTED
	| DocStatusEnum.SUBMITTED;

const proofFinishTypeMap: Record<ProofFinishType, string> = {
	[DocStatusEnum.APPROVED]: "승인",
	[DocStatusEnum.REJECTED]: "반려",
	[DocStatusEnum.SUBMITTED]: "미승인",
};

export default function ReceivedReq({}: {}) {
	const {docState, docDispatch} = useDocsContext();
	const {doc} = docState;

	const [approvalOrRejection, setApprovalOrRejection] =
		useState<ProofFinishType>(DocStatusEnum.SUBMITTED);

	const router = useRouter();
	const pathname = usePathname();
	const [_, mainMenu, subMenu, leafMenu, additionalMenu] =
		pathname.split("/");
	const listUrl =
		getLastUrl() ||
		`/${mainMenu}/${ProofUrlEnum.PROOF}/${ProofUrlEnum.STATUS}/${ProofUrlEnum.STATUS_ALL}`;

	const {openModal, closeModal, modalConfig} = useModal();
	const {matchUserIdToRank} = useUserContext();

	async function getDoc() {
		const res = await requestPost("/docs/getDoc", {
			idx: Number(additionalMenu),
		});
		if (res.statusCode === 200) {
			AlertService.success("문서를 불러왔습니다.");
			console.log(res.data);
			docDispatch({type: "SET_DOC", payload: res.data});
		}
	}

	useEffect(() => {
		getDoc();
	}, [additionalMenu]);

	const openAddingOpinionModal = (type: ProofFinishType) => {
		setApprovalOrRejection(type);
		openModal();
	};

	const onSubmit = async () => {
		console.log(new Date());
		const res = await requestPost("/docs/createOrUpdateProof", {
			...doc,
			status: approvalOrRejection,
			reviewedAt: new Date(),
		});
		if (res.statusCode === 200) {
			AlertService.success(
				`${proofFinishTypeMap[approvalOrRejection]}되었습니다.`
			);
			docDispatch({type: "RESET"});
			router.push(listUrl);
		}
	};

	return (
		<>
			<div className={styles.form}>
				<div className={styles.row}>
					<div className={styles.col}>
						<div className={styles.labelWrapper}>
							<span className={styles.label}>제목</span>
						</div>
						<span className={styles.subTextBlack}>
							{doc?.docNm}
						</span>
					</div>
				</div>
				<div className={styles.row}>
					<div className={styles.col}>
						<div className={styles.labelWrapper}>
							<span className={styles.label}>긴급</span>
						</div>
						<span className={styles.subTextBlack}>
							{doc?.isUrgent ? <GoCircle /> : <GoXCircle />}
						</span>
					</div>
				</div>

				<Divider type="middle" look="dashed" />

				<div className={styles.row}>
					<div className={styles.col}>
						<div className={styles.labelWrapper}>
							<span className={styles.label}>신청자</span>
						</div>
						<span className={styles.subTextBlack}>
							{matchUserIdToRank(doc?.creatorId ?? "")}
						</span>
					</div>
				</div>
				<div className={styles.row}>
					<div className={styles.col}>
						<div className={styles.labelWrapper}>
							<span className={styles.label}>신청일자</span>
						</div>
						<span className={styles.subTextBlack}>
							{fullDateTimeWithLabel(
								new Date(doc?.createdAt ?? "")
							)}
						</span>
					</div>
				</div>

				<Divider type="middle" look="dashed" />

				<FormParser
					htmlString={doc?.docHtml ?? "<p>문서 내용 없음</p>"}
				/>

				<CommonButtonGroup
					usedButtons={{
						btnList: true,
						btnCancel: true,
						btnSubmit: true,
					}}
					onCancel={() =>
						openAddingOpinionModal(DocStatusEnum.REJECTED)
					}
					onSubmit={() =>
						openAddingOpinionModal(DocStatusEnum.APPROVED)
					}
					cancelBtnLabel="반려"
					submitBtnLabel="승인"
					listUrl={listUrl}
				></CommonButtonGroup>

				<Modal
					modalConfig={modalConfig}
					closeModal={closeModal}
					modalTitle={`${proofFinishTypeMap[approvalOrRejection]} 의견 추가`}
					width={"30vw"}
					height={"35vh"}
					footerContent={
						<CommonButtonGroup
							usedButtons={{btnSubmit: true}}
							onSubmit={onSubmit}
						/>
					}
				>
					<AddOpinion />
				</Modal>
			</div>
		</>
	);
}
