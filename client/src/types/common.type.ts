/**
 * Radio, CheckBox 컴포넌트에 사용하는 fakeEvent 타입
 * 실제 이벤트와 호환되도록 target 속성을 추가
 */
export type FakeChangeEventType = React.ChangeEvent<HTMLInputElement> & {
	target: HTMLInputElement & {
		name: string;
		checkValue?: string | number;
		value: boolean;
		type: string;
	};
};

export type SelectOptionType = {
	label: string;
	value: string;
	idx?: number;
};

export type ModeType = "add" | "edit" | "view";

// 페이지네이션
export type PaginationParamsType = {
	page?: number;
	limit?: number;
	isTempSaved: boolean;
	menuId?: string;
	searchKeyword?: string;
};
export type PagedDataType = {
	nextPage?: number;
	previousPage?: number;
	totalPage: number;
	results: any[];
};
