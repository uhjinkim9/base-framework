"use client";

import {useEffect, useRef, useState} from "react";
import {useParams} from "next/navigation";
import clsx from "clsx";

// Common components
import ContentCard from "@/components/common/layout/ContentCard";
import CommonTabs from "@/components/common/layout/CommonTabs";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import FileDrop from "@/components/common/editor/parts/FileDrop";

// Domain-specific components
import DraftWriterComponent, {DraftWriterRef} from "./DraftWriterComponent";
import ApprovalLineList from "./ApprovalLineList";
import AttachmentList from "./AttachmentList";

// Utils and types
import {requestPost} from "@/util/api/api-service";
import {
	DraftFormData,
	ApprovalLine,
	AttachmentFile,
	DraftBasicData,
} from "@/types/draft";
import {PrintUtils} from "@/util/print/print-utils";
// Styles
import style from "./styles/DraftWriter.module.scss";
import AlertService from "@/services/alert.service";

const INITIAL_APPROVAL_LINES: ApprovalLine[] = [
	{
		id: "1",
		name: "홍길동",
		position: "차장",
		department: "인사총무부",
		date: "2025-00-00(수)",
		gubun: "기안상신",
	},
	{
		id: "2",
		name: "이미리",
		position: "차장",
		department: "인사총무부",
		date: "2025-00-00(수)",
		gubun: "확인예정",
	},
	{
		id: "3",
		name: "김형남",
		position: "이사",
		department: "인사총무부",
		date: "2025-00-00(수)",
		gubun: "확인예정",
	},
];

interface DraftWriterProps {}

export default function DraftWriter({}: DraftWriterProps) {
	// Refs
	const draftFormRef = useRef<HTMLDivElement | null>(null);
	const draftWriterRef = useRef<DraftWriterRef>(null);

	// Router params
	const params = useParams();

	// State
	const [draftFormId, setDraftFormId] = useState<string>(
		params.formId as string
	);
	const [fileIndexes, setFileIndexes] = useState<number[]>([]);
	const [attachments, setAttachments] = useState<AttachmentFile[]>([
		{id: "1", name: "파일1.zip", size: "12.34MB"},
		{id: "2", name: "파일2.zip", size: "12.34MB"},
	]);
	const [approvalLines, setApprovalLines] = useState<ApprovalLine[]>(
		INITIAL_APPROVAL_LINES
	);
	const [draftForm, setDraftForm] = useState({} as any);
	const [template, setTemplate] = useState("");
	const [draftNm, setdraftNm] = useState(draftForm.draftFormNm || "");
	const [isLoading, setIsLoading] = useState(false);

	// 기존 state들...
	const [showPrintPreview, setShowPrintPreview] = useState(false);

	// 인쇄 관련 핸들러 추가
	const handlePrint = () => {
		if (draftFormRef.current) {
			PrintUtils.printElement(
				draftFormRef.current,
				`${
					draftForm.draftFormNm || "전자결재"
				} - ${new Date().toLocaleDateString()}`
			);
		} else {
			AlertService.error("인쇄할 내용이 없습니다.");
		}
	};

	const handlePrintPreview = () => {
		if (draftFormRef.current) {
			PrintUtils.showPrintPreview(draftFormRef.current, handlePrint);
		} else {
			AlertService.error("미리보기할 내용이 없습니다.");
		}
	};

	// Handlers
	const handleFinalSubmit = async (html: string) => {
		try {
			setIsLoading(true);

			const draftData: DraftBasicData = {
				// draftId: "1", // 서버에서 자동 생성되므로 임시로 1로 설정
				draftNm: draftNm, // 양식명
				draftFormId: draftFormId,
				draftContent: html,
				attachments: fileIndexes,
				approvalLines: approvalLines.map((line) => line.id),
			};

			const res = await requestPost("/draft/submitDraft", draftData);
			if (res.statusCode === 200) {
				AlertService.success("성공");
			} else {
			}
		} catch (error) {
			AlertService.error("저장 실패: " + error);
			// TODO: Show error message
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		// TODO: Show confirmation dialog
		console.log("취소 버튼 클릭");
		// TODO: Navigate back to list
	};

	const handleSubmit = () => {
		if (draftWriterRef.current) {
			draftWriterRef.current.handleSubmit();
		} else {
			console.warn("DraftWriterComponent ref가 설정되지 않았습니다.");
		}
	};

	const handleTempSave = async () => {
		if (draftWriterRef.current) {
			const formData = draftWriterRef.current.getFormData();
			// TODO: Save as temporary draft
			console.log("임시저장:", formData);
		}
	};

	const handleList = () => {
		// TODO: Navigate to draft list
		console.log("목록으로 이동");
	};

	const handleRemoveAttachment = (attachmentId: string) => {
		setAttachments((prev) =>
			prev.filter((attachment) => attachment.id !== attachmentId)
		);
	};

	const handleApprovalLineReorder = (newOrder: ApprovalLine[]) => {
		setApprovalLines(newOrder);
	};

	// Effects
	useEffect(() => {
		//양식 정보 조회
		const fetchDraftForm = async () => {
			const param = {draftFormId: draftFormId};
			const res = await requestPost("/draft/getDraftForm", param);
			if (res.statusCode === 200) {
				setDraftForm(res.data);
				// setTemplate(res.data.templateHtml);
				// AlertService.success("성공");
			} else {
				AlertService.error(res.message || "양식 조회 실패");
			}
		};

		fetchDraftForm();
	}, [draftFormId]);

	// Render helpers
	const renderAttachments = () => (
		<AttachmentList
			attachments={attachments}
			onRemove={handleRemoveAttachment}
		/>
	);

	const renderApprovalLines = () => (
		<ApprovalLineList
			approvalLines={approvalLines}
			onReorder={handleApprovalLineReorder}
		/>
	);

	const renderDocumentInfo = () => (
		<div className={style.documentInfo}>
			<div className={style.infoRow}>
				<span className={style.label}>문서번호:</span>
				<span className={style.value}>{draftFormId}</span>
			</div>
			<div className={style.infoRow}>
				<span className={style.label}>작성일:</span>
				<span className={style.value}>
					{new Date().toLocaleDateString()}
				</span>
			</div>
			<div className={style.infoRow}>
				<span className={style.label}>상태:</span>
				<span className={style.value}>작성중</span>
			</div>
			<div className={style.infoRow}>
				<span className={style.label}>전결규정:</span>
				<span className={style.value}>
					아이유(합의) → 팀장(결재) → 본부장(결재) → 본부장(대표이사)
				</span>
			</div>
			<div className={style.infoRow}>
				<span className={style.label}>작성가이드:</span>
				<span className={style.value}>
					<li>결재선은...</li>
					<li>첨부파일은...</li>
				</span>
			</div>
		</div>
	);

	return (
		<div className={style.container}>
			{/* Main Content */}
			<div className={style.containerMain}>
				<div style={{marginBottom: "1rem"}}>
					<ContentCard fullHeight={false}>
						<div>
							<input
								value={draftNm}
								onChange={(e) => setdraftNm(e.target.value)}
								placeholder="문서제목을 입력하세요"
							/>
						</div>
					</ContentCard>
				</div>
				<ContentCard fullHeight={false}>
					<div ref={draftFormRef}>
						{/* 기안양식명 */}
						<div className={style.draftSubject}>
							{draftForm.draftFormNm}
						</div>

						{/* Draft Form Content */}
						<div
							className={clsx(style.border, style.border2px)}
							style={{minHeight: "500px", padding: "1.5rem"}}
						>
							<DraftWriterComponent
								ref={draftWriterRef}
								templateHtml={draftForm.templateHtml || ""}
								onSave={handleFinalSubmit}
							/>
						</div>

						{/* Attachments Section */}
						<div className={style.attachmentsSection}>
							{renderAttachments()}
							<div className={clsx("no-print")}>
								<FileDrop setFileIndexes={setFileIndexes} />
							</div>
						</div>
					</div>
					{/* Action Buttons */}
					<div className={style.spaceBetween}>
						<CommonButtonGroup
							usedButtons={{
								btnEdit: true,
							}}
							onCancel={handleCancel}
						/>

						<CommonButtonGroup
							usedButtons={{
								btnTempSave: true,
								btnSubmit: true,
								btnCancel: true,
								btnPreview: true,
								btnList: true,
								btnPrint: true,
							}}
							onCancel={handleCancel}
							onSubmit={handleSubmit}
							onShowPreview={handlePrintPreview}
							onPrint={handlePrint}
							isEditing={isLoading}
						/>
					</div>
				</ContentCard>
			</div>

			{/* Sidebar */}
			<div className={style.containerSide}>
				<ContentCard fullHeight={false}>
					<CommonTabs
						tabs={[<>결재선</>, <>문서정보</>]}
						tabContents={[
							renderApprovalLines(),
							renderDocumentInfo(),
						]}
					/>
				</ContentCard>
			</div>
		</div>
	);
}
