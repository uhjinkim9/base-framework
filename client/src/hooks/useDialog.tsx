"use client";

import {useState, useCallback} from "react";

export type DialogConfigType = {
	isOpened: boolean;
	easyClose?: boolean; // 바깥 클릭/ESC로 닫기 허용
	isNoLayer?: boolean; // 딤드 레이어 숨김 여부
	onClose?: () => void; // 취소/닫기 통합 콜백
};

export default function useDialog(initialConfig?: Partial<DialogConfigType>) {
	const [dialogConfig, setDialogConfig] = useState<DialogConfigType>({
		isOpened: false,
		easyClose: true,
		isNoLayer: false,
		onClose: undefined,
		...initialConfig,
	});

	// 열기
	const openDialog = useCallback(() => {
		setDialogConfig((prev) => ({...prev, isOpened: true}));
	}, []);

	// 닫기(+ onClose 실행)
	const closeDialog = useCallback(() => {
		setDialogConfig((prev) => {
			prev.onClose?.(); // 통합 취소 콜백
			return {...prev, isOpened: false};
		});
	}, []);

	// 확인: 별도 콜백 없이 그냥 닫기 (확인 로직은 Dialog prop으로 처리)
	const confirmDialog = useCallback(() => {
		setDialogConfig((prev) => ({...prev, isOpened: false}));
	}, []);

	return {
		dialogConfig,
		openDialog,
		closeDialog,
		confirmDialog,
		setDialogConfig,
	};
}
