"use client";
import {
	createContext,
	useContext,
	useState,
	useReducer,
	useEffect,
} from "react";

import {
	BoardMenusType,
	BoardStateType,
	PostStateType,
} from "@/components/src/community/board/etc/board.type";

import {
	PostAction,
	postReducer,
	BoardAction,
	boardReducer,
} from "@/reducers/board.reducer";
import {
	initialBoardState,
	initialPostState,
} from "@/reducers/etc/board-initial-state";
import {PagedDataType} from "@/types/common.type";

const BoardContext = createContext<{
	paginatedList: PagedDataType;
	setPaginatedList: React.Dispatch<React.SetStateAction<PagedDataType>>;

	// 게시판 사이드바 메뉴들
	boardMenus: BoardMenusType;
	setBoardMenus: React.Dispatch<React.SetStateAction<BoardMenusType>>;

	postState: PostStateType;
	postDispatch: React.Dispatch<PostAction>;
	boardState: BoardStateType;
	boardDispatch: React.Dispatch<BoardAction>;
} | null>(null);

export type BoardPagedDataType = PagedDataType & {
	postViews?: any[];
};

export const BoardProvider = ({children}: {children: React.ReactNode}) => {
	const [postState, postDispatch] = useReducer(postReducer, initialPostState);
	const [boardState, boardDispatch] = useReducer(
		boardReducer,
		initialBoardState
	);
	const [boardMenus, setBoardMenus] = useState<BoardMenusType>({
		cpBoards: [],
		psBoards: [],
	});
	const [paginatedList, setPaginatedList] = useState<BoardPagedDataType>({
		nextPage: 0,
		previousPage: 0,
		results: [],
		totalPage: 0,
	});

	return (
		<BoardContext.Provider
			value={{
				paginatedList,
				setPaginatedList,
				boardMenus,
				setBoardMenus,
				postState,
				postDispatch,
				boardState,
				boardDispatch,
			}}
		>
			{children}
		</BoardContext.Provider>
	);
};

export const useBoardContext = () => {
	const context = useContext(BoardContext);
	if (!context) {
		throw new Error("BoardProvider가 누락되었습니다.");
	}
	return context;
};
