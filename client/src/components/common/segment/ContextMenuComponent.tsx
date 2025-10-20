"use client";
import {useEffect, useRef, useState} from "react";
import styles from "./styles/ContextMenuComponent.module.scss";
import {useContextMenu} from "@/context/ContextMenu";

type MenuItemType = {
	type: string;
	label: string;
};

export default function ContextMenuComponent({
	handleClickContextMenu,
	menuItems = [],
}: {
	handleClickContextMenu: (type: string) => void;
	menuItems?: MenuItemType[];
}) {
	const {menu, handleContextMenuClose} = useContextMenu();
	const menuRef = useRef<HTMLUListElement>(null);

	// 바깥 클릭 시 닫기
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as Node)
			) {
				handleContextMenuClose();
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [handleContextMenuClose]);

	if (!menu) return null;

	return (
		<>
			<ul
				style={{
					position: "absolute",
					top: `${menu.mouseY}px`,
					left: `${menu.mouseX}px`,
				}}
				className={styles.contextMenu}
				ref={menuRef}
			>
				<li>추가할 항목</li>
				{menuItems.map(({type, label}) => (
					<li
						key={type}
						onClick={() => {
							handleContextMenuClose();
							handleClickContextMenu(type);
						}}
					>
						{label}
					</li>
				))}
			</ul>
		</>
	);
}
