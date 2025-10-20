import styles from "./styles/Modal.module.scss";
import {useCallback, useEffect, useRef} from "react";
import {IoMdClose} from "react-icons/io";

export type ModalConfigType = {
	isOpened: boolean;
	easyClose?: boolean;
	// isDraggable?: boolean;
	isNoLayer?: boolean;
	onClose?: () => void;
};

type ModalPropsType = {
	modalConfig: ModalConfigType;
	children: React.ReactNode;
	closeModal?: any;
	modalTitle?: string;
	width?: string;
	height?: string;
	footerContent?: React.ReactNode;
};

export default function Modal({
	modalConfig,
	children,
	closeModal,
	modalTitle,
	width = "80vw",
	height = "50vw",
	footerContent = null,
}: ModalPropsType) {
	const modalRef = useRef<HTMLDivElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);

	const onCloseModal = useCallback(() => {
		modalConfig.onClose?.();
		closeModal();
	}, [modalConfig.onClose, closeModal]);

	useEffect(() => {
		function handleEsc(e: KeyboardEvent) {
			if (e.key === "Escape" && modalConfig.easyClose) {
				onCloseModal();
			}
		}
		document.addEventListener("keydown", handleEsc);
		return () => document.removeEventListener("keydown", handleEsc);
	}, [modalConfig.easyClose, onCloseModal]);

	// useEffect(() => {
	// 	if (
	// 		modalConfig.isDraggable &&
	// 		modalRef.current &&
	// 		headerRef.current
	// 	) {
	// 		const modal = modalRef.current;
	// 		const header = headerRef.current;
	// 		let offsetX = 0,
	// 			offsetY = 0;
	// 		let isDragging = false;

	// 		const onMouseDown = (e: MouseEvent) => {
	// 			isDragging = true;
	// 			offsetX = e.clientX - modal.getBoundingClientRect().left;
	// 			offsetY = e.clientY - modal.getBoundingClientRect().top;
	// 			document.addEventListener("mousemove", onMouseMove);
	// 			document.addEventListener("mouseup", onMouseUp);
	// 		};

	// 		const onMouseMove = (e: MouseEvent) => {
	// 			if (isDragging) {
	// 				modal.style.left = `${e.clientX - offsetX}px`;
	// 				modal.style.top = `${e.clientY - offsetY}px`;
	// 				modal.style.position = "absolute";
	// 			}
	// 		};

	// 		const onMouseUp = () => {
	// 			isDragging = false;
	// 			document.removeEventListener("mousemove", onMouseMove);
	// 			document.removeEventListener("mouseup", onMouseUp);
	// 		};

	// 		header.addEventListener("mousedown", onMouseDown);
	// 		return () => header.removeEventListener("mousedown", onMouseDown);
	// 	}
	// }, [modalConfig.isDraggable]);

	if (!modalConfig.isOpened) return null;

	return (
		<div className={styles.modalWrapper}>
			{!modalConfig.isNoLayer && (
				<div
					className={styles.dimmed}
					onClick={modalConfig.easyClose ? onCloseModal : undefined}
				/>
			)}
			<div
				className={styles.modal}
				ref={modalRef}
				style={{width: width, height: height}}
			>
				<div className={styles.header} ref={headerRef}>
					<span className={styles.title}>{modalTitle}</span>
					<IoMdClose
						className={styles.closeIcon}
						onClick={onCloseModal}
					/>
				</div>
				<div className={styles.body}>{children}</div>
				<div className={styles.footer}>{footerContent}</div>
			</div>
		</div>
	);
}
