"use client";
import {createContext, useState, JSX, useContext} from "react";

/**
 * @fileoverview ContextMenuProvider 컴포넌트
 * @description 마우스 우클릭 위치를 기반으로 Context Menu를 관리하는 전역 Context Provider
 * @interface ContextMenuContext
 * @property {menu: { mouseX: number; mouseY: number } | null} - 컨텍스트 메뉴 위치 정보
 * @property {handleContextMenuOpen} - 컨텍스트 메뉴 오픈 함수 (우클릭 이벤트 기반)
 * @property {handleContextMenuClose} - 컨텍스트 메뉴 닫기 함수
 *
 * @author 김어진
 * @created 2025-05-19
 * @version 1.0.0
 */

const ContextMenu = createContext<{
	menu: {mouseX: number; mouseY: number} | null;
	handleContextMenuClose: () => void;
	handleContextMenuOpen: (event: React.MouseEvent) => void;
}>({
	menu: null,
	handleContextMenuClose: () => {},
	handleContextMenuOpen: (event: React.MouseEvent) => {},
});

type Props = {
	children: JSX.Element | JSX.Element[];
};

export const ContextMenuProvider = ({children}: Props): JSX.Element => {
	const [menu, setMenu] = useState<{mouseX: number; mouseY: number} | null>(
		null
	);

	const handleContextMenuClose = () => {
		setMenu(null);
	};

	const handleContextMenuOpen = (e: React.MouseEvent) => {
		e.preventDefault();

		setMenu(
			menu === null
				? {
						mouseX: e.clientX,
						mouseY: e.clientY,
				  }
				: null
		);
	};

	return (
		<ContextMenu.Provider
			value={{menu, handleContextMenuClose, handleContextMenuOpen}}
		>
			{children}
		</ContextMenu.Provider>
	);
};

export const useContextMenu = () => {
	return useContext(ContextMenu);
};
