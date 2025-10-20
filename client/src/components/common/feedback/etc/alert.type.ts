export enum AlertEnum {
	SUCCESS = "success",
	INFO = "info",
	WARN = "warn",
	ERROR = "error",
}

// Alert.tsx
export type AlertPropType = {
	id: string; // 부모에게 자신을 지워달라고 요청할 때 사용할 id
	type: AlertEnum;
	message: string;
	useConfirmBtn?: boolean;
	useCancelBtn?: boolean;
	onConfirm?: () => void;
	onCancel?: () => void;
	// Alert 컴포넌트가 제거될 준비가 되었음을 부모에게 알리는 함수
	onRemoveRequest: (id: string) => void;
};

export type ConfirmOptions = {
	useConfirmBtn?: boolean;
	useCancelBtn?: boolean;
	onConfirm?: () => void;
	onCancel?: () => void;
};

// AlertContext.tsx
export type AlertItemType = {
	id: string;
	type: AlertEnum;
	message: string;
	useConfirmBtn?: boolean;
	useCancelBtn?: boolean;
	onConfirm?: () => void;
	onCancel?: () => void;
};
