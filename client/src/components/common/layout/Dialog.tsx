"use client";

import styles from "./styles/Dialog.module.scss";
import {useCallback, useEffect, useRef} from "react";
import {IoMdClose} from "react-icons/io";
import type {ReactNode} from "react";

/**
 * @example
 * const { dialogConfig, openDialog, closeDialog, confirmDialog, setDialogConfig } = useDialog({
 *   easyClose: true,
 * });
 *
 * <button
 *   onClick={() => {
 *     setDialogConfig(prev => ({
 *       ...prev,
 *       onClose: () => console.log('취소/닫기!'),
 *     }));
 *     openDialog();
 *   }}
 * >
 *   다이얼로그 열기
 * </button>
 *
 * <Dialog
 *   dialogConfig={dialogConfig}
 *   dialogTitle="확인이 필요해요"
 *   closeDialog={closeDialog}
 *   confirmDialog={() => console.log('확인!')}
 *   confirmText="확인"
 *   cancelText="취소"
 *   width="480px"
 *   height="auto"
 * >
 *   정말 진행하시겠습니까? 되돌릴 수 없어요.
 * </Dialog>
 */

export type DialogConfigType = {
	isOpened: boolean;
	easyClose?: boolean;
	isNoLayer?: boolean;
	onClose?: () => void; // 취소/닫기 통합
};

type DialogProps = {
	dialogConfig: DialogConfigType;
	children: ReactNode; // 본문(문구/커스텀 노드)
	closeDialog: () => void; // 닫기 함수(훅에서 주입)
	confirmDialog?: () => void; // 확인 함수(훅에서 주입)
	dialogTitle?: string;
	width?: string;
	height?: string;
	footerContent?: ReactNode; // 커스텀 풋터(없으면 기본 확인/취소)
	confirmText?: string;
	cancelText?: string;
	hideFooter?: boolean; // 버튼 영역 숨김
};

export default function Dialog({
	dialogConfig,
	children,
	closeDialog,
	confirmDialog,
	dialogTitle,
	width = "30rem",
	height = "auto",
	footerContent = null,
	confirmText = "확인",
	cancelText = "취소",
	hideFooter = false,
}: DialogProps) {
	const modalRef = useRef<HTMLDivElement>(null);

	const onCancel = useCallback(() => {
		dialogConfig.onClose?.(); // 통합 취소 콜백
		closeDialog();
	}, [dialogConfig.onClose, closeDialog]);

	const onConfirm = useCallback(() => {
		confirmDialog?.();
		closeDialog();
	}, [confirmDialog, closeDialog]);

	// ESC 닫기
	useEffect(() => {
		function handleEsc(e: KeyboardEvent) {
			if (e.key === "Escape" && dialogConfig.easyClose) onCancel();
		}
		document.addEventListener("keydown", handleEsc);
		return () => document.removeEventListener("keydown", handleEsc);
	}, [dialogConfig.easyClose, onCancel]);

	if (!dialogConfig.isOpened) return null;

	return (
		<div className={styles.modalWrapper}>
			{!dialogConfig.isNoLayer && (
				<div
					className={styles.dimmed}
					onClick={dialogConfig.easyClose ? onCancel : undefined}
				/>
			)}
			<div
				className={styles.modal}
				ref={modalRef}
				style={{width, height}}
				role="dialog"
				aria-modal="true"
				aria-labelledby="dialog-title"
			>
				<div className={styles.header}>
					<span id="dialog-title" className={styles.title}>
						{dialogTitle}
					</span>
					<IoMdClose
						className={styles.closeIcon}
						onClick={onCancel}
					/>
				</div>

				<div className={styles.body}>{children}</div>

				{!hideFooter && (
					<div className={styles.footer}>
						{footerContent ?? (
							<>
								<button
									className={styles.confirmBtn}
									onClick={onConfirm}
								>
									{confirmText}
								</button>{" "}
								<button
									className={styles.cancelBtn}
									onClick={onCancel}
								>
									{cancelText}
								</button>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
