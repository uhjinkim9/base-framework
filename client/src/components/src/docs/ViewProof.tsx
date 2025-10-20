"use client";

import styles from "./styles/AddDoc.module.scss";
import AlertService from "@/services/alert.service";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useRef} from "react";
import {GoCircle, GoXCircle} from "react-icons/go";

import {useDocsContext} from "@/context/DocsContext";
import {DocStatusEnum} from "./etc/docs.type";
import {ProofUrlEnum} from "./etc/url.enum";

import {fullDateTimeWithLabel} from "@/util/helpers/formatters";
import {exportToPdf, generatePdfFilename} from "@/util/common/pdf-export";
import {useUserContext} from "@/context/UserContext";
import {requestPost} from "@/util/api/api-service";
import {getLastUrl} from "@/util/common/last-url";

import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import FormParser from "@/components/common/editor/FormParser";
import useDialog from "@/hooks/useDialog";
import Divider from "@/components/common/segment/Divider";
import Dialog from "@/components/common/layout/Dialog";

export default function ViewProof({}: {}) {
	const {docState, docDispatch} = useDocsContext();
	const {doc} = docState;

	// PDF 생성을 위한 ref
	const documentRef = useRef<HTMLDivElement>(null);

	const router = useRouter();
	const pathname = usePathname();
	const [_, mainMenu, subMenu, leafMenu, additionalMenu] =
		pathname.split("/");
	const listUrl =
		getLastUrl() ||
		`/${mainMenu}/${ProofUrlEnum.PROOF}/${ProofUrlEnum.STATUS}/${ProofUrlEnum.STATUS_ALL}`;

	const {dialogConfig, openDialog, closeDialog} = useDialog();
	const {matchUserIdToRank} = useUserContext();

	async function getDoc() {
		const res = await requestPost("/docs/getDoc", {
			idx: Number(additionalMenu),
		});
		if (res.statusCode === 200) {
			AlertService.success("문서를 불러왔습니다.");
			docDispatch({type: "SET_DOC", payload: res.data});
		}
	}

	useEffect(() => {
		getDoc();
	}, [additionalMenu]);

	const onCancelProof = async () => {
		const res = await requestPost("/docs/createOrUpdateProof", {
			idx: doc?.idx,
			status: DocStatusEnum.CANCELED,
		});
		if (res.statusCode === 200) {
			AlertService.success("문서가 철회되었습니다.");
			docDispatch({type: "RESET"});
			router.push(listUrl);
		}
	};

	const onClickEdit = () => {
		router.push(
			`/${mainMenu}/${ProofUrlEnum.PROOF}/${ProofUrlEnum.ADD}/${doc?.idx}`
		);
	};

	const onClickDownload = async () => {
		if (!documentRef.current || !doc) {
			AlertService.error("문서를 찾을 수 없습니다.");
			return;
		}

		try {
			AlertService.info("PDF 생성 중입니다...");

			const filename = generatePdfFilename(doc?.docNm);

			await exportToPdf(documentRef.current, {
				filename,
				quality: 2, // 고해상도
				format: "a2",
				orientation: "portrait",
				margin: {
					top: 50,
					bottom: 30,
					left: 25,
					right: 25,
				},
			});

			AlertService.success("PDF 다운로드가 완료되었습니다.");
		} catch (error) {
			console.error("PDF 생성 오류:", error);
			AlertService.error("PDF 생성 중 오류가 발생했습니다.");
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
				<div className={styles.row}>
					<div className={styles.col}>
						<div className={styles.labelWrapper}>
							<span className={styles.label}>임시저장</span>
						</div>
						<span className={styles.subTextBlack}>
							{doc?.isTempSaved ? <GoCircle /> : <GoXCircle />}
						</span>
					</div>
				</div>
				<div className={styles.row}>
					<div className={styles.col}>
						<div className={styles.labelWrapper}>
							<span className={styles.label}>예약</span>
						</div>
						<span className={styles.subTextBlack}>
							{doc?.isScheduled ? <GoCircle /> : <GoXCircle />}
						</span>
					</div>
				</div>
				{doc?.isScheduled && (
					<div className={styles.row}>
						<div className={styles.col}>
							<div className={styles.labelWrapper}>
								<span className={styles.label}>예약일자</span>
							</div>
							<span className={styles.subTextBlack}>
								{fullDateTimeWithLabel(doc?.scheduledAt ?? "")}
							</span>
						</div>
					</div>
				)}

				<Divider type="middle" look="dashed" />
				<div className={styles.row}>
					<div className={styles.col}>
						<div className={styles.labelWrapper}>
							<span className={styles.label}>담당자</span>
						</div>
						<span className={styles.subTextBlack}>
							{matchUserIdToRank(doc?.reviewerId ?? "")}
						</span>
					</div>
				</div>

				{doc.status === DocStatusEnum.APPROVED && (
					<>
						<div className={styles.row}>
							<div className={styles.col}>
								<div className={styles.labelWrapper}>
									<span className={styles.label}>의견</span>
								</div>
								<span className={styles.subTextBlack}>
									{doc?.reviewComment}
								</span>
							</div>
						</div>

						<div className={styles.row}>
							<div className={styles.col}>
								<div className={styles.labelWrapper}>
									<span className={styles.label}>
										승인일자
									</span>
								</div>
								<span className={styles.subTextBlack}>
									{fullDateTimeWithLabel(
										new Date(doc?.reviewedAt ?? "")
									)}
								</span>
							</div>
						</div>
					</>
				)}

				<Divider type="middle" look="dashed" />

				<FormParser
					ref={documentRef}
					htmlString={doc?.docHtml ?? "<p>문서 내용 없음</p>"}
				/>

				<CommonButtonGroup
					usedButtons={{
						btnList: true,
						btnEdit: doc.isTempSaved, // 임시저장일 경우에 '수정' 활성화
						btnCancel: doc.status === DocStatusEnum.SUBMITTED,
						btnDownload: doc.status === DocStatusEnum.APPROVED, // TODO: 승인일 때만 활성화
					}}
					cancelBtnLabel="철회"
					listUrl={listUrl}
					onEdit={onClickEdit}
					onCancel={openDialog}
					onDownload={onClickDownload}
				></CommonButtonGroup>

				<Dialog
					dialogConfig={dialogConfig}
					dialogTitle="철회 확인"
					closeDialog={closeDialog}
					confirmDialog={onCancelProof}
					confirmText="확인"
					cancelText="취소"
					width="30rem"
					height="auto"
				>
					문서를 철회하시겠습니까? 되돌릴 수 없습니다.
				</Dialog>
			</div>
		</>
	);
}
