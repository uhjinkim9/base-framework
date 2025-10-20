"use client";
import styles from "./styles/Alert.module.scss";
import React, {useEffect, useState, useCallback, useRef} from "react";
import {createPortal} from "react-dom";

import {FaCheck, FaInfo, FaExclamation, FaXmark} from "react-icons/fa6";
import {
	AlertEnum,
	AlertPropType,
} from "@/components/common/feedback/etc/alert.type";

const iconMap: Record<AlertEnum, React.ReactNode> = {
	[AlertEnum.SUCCESS]: <FaCheck />,
	[AlertEnum.INFO]: <FaInfo />,
	[AlertEnum.WARN]: <FaExclamation />,
	[AlertEnum.ERROR]: <FaXmark />,
};

// CSS 애니메이션 duration과 동일하게 설정
const ANIMATION_DURATION = 500;

function Alert({
	id,
	type,
	message,
	useConfirmBtn = false,
	useCancelBtn = false,
	onConfirm,
	onCancel,
	onRemoveRequest,
}: AlertPropType) {
	// Alert 자신의 애니메이션 상태를 관리하는 state
	const [animationClass, setAnimationClass] = useState("");

	useEffect(() => {
		// 포탈에 렌더링된 다음 프레임에서 slideIn 시작
		const frame = requestAnimationFrame(() => {
			setAnimationClass("slideIn");
		});
		return () => cancelAnimationFrame(frame);
	}, []);

	useEffect(() => {
		if (!useConfirmBtn) {
			const autoDismissTimer = setTimeout(() => {
				setAnimationClass("slideOut");
				setTimeout(() => {
					onRemoveRequest(id);
				}, ANIMATION_DURATION);
			}, 2500);
			return () => clearTimeout(autoDismissTimer);
		}
	}, [id, onRemoveRequest, useConfirmBtn]);

	// 확인/취소 버튼 또는 직접 닫기 버튼 클릭 시 실행할 함수
	// slideOut 애니메이션을 시작하고, 애니메이션이 끝난 후 제거되도록 함 (useEffect가 처리)
	const handleClose = useCallback(
		(callback?: () => void) => {
			setAnimationClass("slideOut");
			setTimeout(() => {
				callback?.();
				onRemoveRequest(id);
			}, ANIMATION_DURATION);
		},
		[id, onRemoveRequest]
	);

	const handleConfirmClick = useCallback(() => {
		handleClose(onConfirm);
	}, [handleClose, onConfirm]);

	const handleCancelClick = useCallback(() => {
		handleClose(onCancel);
	}, [handleClose, onCancel]);

	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		if (typeof document === "undefined") return;
		const alertRoot = document.getElementById("alertRoot");
		ref.current = alertRoot;
	}, []);

	if (!ref.current) return null;

	return createPortal(
		<div
			className={`${styles.container} ${styles[type]} ${styles[animationClass]}`}
		>
			<div className={styles.wrapper}>
				<div className={`${styles.iconWrapper} ${styles[type]}`}>
					{iconMap[type]}
				</div>
				<span className={`${styles.message} ${styles[type]}`}>
					{message}
				</span>
			</div>
			<div className={styles.buttonGroup}>
				{useConfirmBtn && (
					<div className={styles.button} onClick={handleConfirmClick}>
						확인
					</div>
				)}
				{useCancelBtn && (
					<div className={styles.button} onClick={handleCancelClick}>
						취소
					</div>
				)}
			</div>
		</div>,
		ref.current
	);
}

export default React.memo(Alert);
