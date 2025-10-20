import React from "react";
import InputBasic from "@/components/common/form-properties/InputBasic";

export type FieldParams = {
	name: string;
	label: string;
	placeholder?: string;
	value: any;
	onChange: any;
	width?: string;
};

export type FieldType =
	| "text"
	| "number"
	| "email"
	| "password"
	| "tel"
	| "url"
	| "date"
	| "time";

// 심플 팩토리 패턴
const createInputBasic = (type: string, params: FieldParams) =>
	React.createElement(InputBasic, {
		type,
		name: params.name,
		label: params.label,
		placeholder: params.placeholder,
		value: params.value,
		onChange: params.onChange,
		width: params.width,
	});

// 전략 패턴
const fieldTypeMap: Record<
	FieldType,
	(params: FieldParams) => React.ReactNode
> = {
	text: (params) => createInputBasic("text", params),
	number: (params) => createInputBasic("number", params),
	email: (params) => createInputBasic("email", params),
	password: (params) => createInputBasic("password", params),
	tel: (params) => createInputBasic("tel", params),
	url: (params) => createInputBasic("url", params),
	date: (params) => createInputBasic("date", params),
	time: (params) => createInputBasic("time", params),
};

// 파사드 패턴
export const getFieldComponent = (
	fieldType: FieldType,
	params: FieldParams
): React.ReactNode => {
	const componentCreator = fieldTypeMap[fieldType];
	return componentCreator
		? componentCreator(params)
		: fieldTypeMap.text(params);
};

export default fieldTypeMap;
