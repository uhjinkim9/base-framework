import {useState, useCallback} from "react";
import {ModalConfigType} from "@/components/common/layout/Modal";

/**
 * @fileoverview useModal 훅
 * @description 모달의 열기, 닫기 상태를 관리하는 커스텀 훅
 *
 * @interface ModalConfigType
 * @property {boolean} isOpened - 모달의 열림/닫힘 상태
 * @property {boolean} easyClose - 모달 외부 클릭 시 모달을 닫을 수 있는지 여부
 * @property {boolean} isNoLayer - 모달에 레이어를 추가할지 여부
 * @property {() => void} [onClose] - 모달 닫기 시 호출될 콜백 함수
 *
 * @function openModal - 모달을 열기 위한 함수
 * @function closeModal - 모달을 닫기 위한 함수
 *
 * @returns {object} - 모달 상태와 상태를 변경하는 함수들 (모달 상태, openModal, closeModal, setModalConfig)
 *
 * @example
 * const { modalConfig, closeModal } = useModal();
 * <Modal
 *   modalConfig={modalConfig}
 *   closeModal={closeModal}
 * >모달내용</Modal>
 *
 * modalConfig 프로퍼티는 타입 ModalConfigType 참고
 *
 * @author 김어진
 * @created 2025-04-07
 * @version 1.0.0
 */

export default function useModal(initialConfig?: Partial<ModalConfigType>) {
	const [modalConfig, setModalConfig] = useState<ModalConfigType>({
		isOpened: false,
		easyClose: true,
		isNoLayer: false,
		onClose: undefined,
		...initialConfig,
	});

	// 모달 열기
	const openModal = useCallback(() => {
		setModalConfig((prev) => ({...prev, isOpened: true}));
	}, []);

	// 모달 닫기 + onClose 실행
	const closeModal = useCallback(() => {
		setModalConfig((prev) => {
			if (prev.onClose) prev.onClose(); // 콜백 실행
			return {...prev, isOpened: false};
		});
	}, []);

	return {
		modalConfig,
		openModal,
		closeModal,
		setModalConfig,
	};
}
