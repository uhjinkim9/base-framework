import {DocStateType, DocType} from "@/components/src/docs/etc/docs.type";
import {ModeType} from "@/types/common.type";
import {initialDocState} from "./etc/doc-initial-state";

export type DocAction =
	| {type: "SET_DOC"; payload: DocType}
	| {
			type: "UPDATE_DOC_FIELD";
			payload: {
				idx?: number;
				docId?: string;
				name: keyof DocType;
				value: any;
			};
	  }
	| {type: "RESET"}
	| {type: "SET_MODE"; payload: ModeType}
	| {type: "SET_SELECTED"; payload: number | string};

export function docReducer(
	state: DocStateType,
	action: DocAction
): DocStateType {
	switch (action.type) {
		case "SET_DOC":
			return {
				...state,
				doc: action.payload,
			};

		case "UPDATE_DOC_FIELD":
			return {
				...state,
				doc: {
					...state.doc,
					[action.payload.name]: action.payload.value,
				},
			};

		case "RESET":
			return {
				...initialDocState,
			};

		case "SET_MODE":
			return {
				...state,
				mode: action.payload,
			};

		case "SET_SELECTED":
			return {
				...state,
				selected: action.payload,
			};
	}
}
