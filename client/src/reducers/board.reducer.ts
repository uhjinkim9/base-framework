"use client";
import {
	BoardStateType,
	PostStateType,
	PostType,
} from "@/components/src/community/board/etc/board.type";
import {SideBarMenuType} from "@/types/menu.type";
import {initialBoardState, initialPostState} from "./etc/board-initial-state";
import {ModeType} from "@/types/common.type";

export type PostAction =
	| {type: "SET_POST"; payload: PostType}
	| {type: "UPDATE_POST_FIELD"; payload: {name: keyof PostType; value: any}}
	| {type: "UPDATE_POST_FIELDS"; payload?: Partial<PostType>}
	| {type: "SET_SELECTED"; payload: number}
	| {type: "SET_MODE"; payload: ModeType}
	| {type: "RESET"; payload?: Partial<PostType>};

export type BoardAction =
	| {type: "SET_BOARD"; payload: SideBarMenuType}
	| {
			type: "UPDATE_BOARD_FIELD";
			payload: {name: keyof SideBarMenuType; value: any};
	  }
	| {type: "UPDATE_BOARD_FIELDS"; payload?: Partial<SideBarMenuType>}
	| {type: "RESET"; payload?: Partial<SideBarMenuType>}
	| {type: "SET_MODE"; payload: string} // add, edit, view
	| {type: "SET_SELECTED"; payload: number};

export function postReducer(
	state: PostStateType,
	action: PostAction
): PostStateType {
	switch (action.type) {
		case "SET_POST":
			return {
				...state,
				post: action.payload,
			};

		case "UPDATE_POST_FIELD":
			return {
				...state,
				post: {
					...state.post,
					[action.payload.name]: action.payload.value,
				},
			};

		case "UPDATE_POST_FIELDS":
			return {
				...state,
				...action.payload,
			};

		case "SET_SELECTED":
			return {
				...state,
				selected: action.payload,
			};

		case "SET_MODE":
			return {
				...state,
				mode: action.payload,
			};

		case "RESET":
			return {
				...initialPostState,
			};

		default:
			return state;
	}
}

export function boardReducer(
	state: BoardStateType,
	action: BoardAction
): BoardStateType {
	switch (action.type) {
		case "SET_BOARD":
			return {
				...state,
				board: action.payload,
			};

		case "UPDATE_BOARD_FIELD":
			return {
				...state,
				board: {
					...state.board,
					[action.payload.name]: action.payload.value,
				},
			};

		case "UPDATE_BOARD_FIELDS":
			return {
				...state,
				...action.payload,
			};

		case "RESET":
			return {
				...initialBoardState,
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

		default:
			return state;
	}
}
