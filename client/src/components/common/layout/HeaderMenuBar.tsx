"use client";
import styles from "./styles/HeaderMenuBar.module.scss";
import {useRouter, usePathname} from "next/navigation";

import {useMenuData} from "@/context/MenuContext";
import {MenuType} from "@/types/menu.type";

type HeaderMenuBarProps = {
	closeMenu: () => void;
};

export default function HeaderMenuBar({closeMenu}: HeaderMenuBarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [_, mainMenu, subMenu] = pathname.split("/");

	// MenuProvider가 없는 경우를 대비한 안전 장치
	let menuData: any[] = [];
	let expandedMenus: string[] = [];
	let toggleMenuExpansion: (menuId: string) => void = () => {};
	let filterFirstNodes: any = () => [];
	let filterSecondNodes: any = () => [];

	try {
		const menuContext = useMenuData();
		menuData = menuContext.menuData;
		expandedMenus = menuContext.expandedMenus;
		toggleMenuExpansion = menuContext.toggleMenuExpansion;
		filterFirstNodes = menuContext.filterFirstNodes;
		filterSecondNodes = menuContext.filterSecondNodes;
	} catch (error) {
		console.warn("MenuProvider를 찾을 수 없습니다:", error);
	}

	// 대분류 메뉴 가져오기 (node_level = 1)
	const mainMenus = filterFirstNodes(menuData);

	// 중분류 메뉴 가져오기 (node_level = 2)
	const getSubMenus = (upperNodeId: string) => filterSecondNodes(upperNodeId);

	// 메인 메뉴 클릭 시 서브메뉴 토글 (여러 개 동시 열기 가능)
	function onClickMainMenu(mainMenuId: string) {
		toggleMenuExpansion(mainMenuId);
	}

	function onClickSubMenu(mainMenuId: string, subMenuId: string) {
		router.push(`/${mainMenuId}/${subMenuId}`);
	}

	return (
		<div className={styles.menuBarWrapper}>
			<nav className={styles.menuBar}>
				<ul className={styles.menuList}>
					{mainMenus.map((mainMenu: MenuType) => {
						const subMenus = getSubMenus(mainMenu.menuId);
						const isActive = expandedMenus.includes(
							mainMenu.menuId
						);

						return (
							<li
								key={mainMenu.idx}
								className={`${styles.mainMenu} ${
									isActive ? styles.active : ""
								}`}
							>
								<div
									className={styles.categoryArea}
									onClick={() =>
										onClickMainMenu(mainMenu.menuId)
									}
								>
									<p className={styles.mainMenuNm}>
										{mainMenu.menuNm}
									</p>
									<ul className={styles.subMenuList}>
										{subMenus.map((sub: MenuType) => {
											const isSubMenuActive =
												sub.menuId === subMenu;
											return (
												<li
													key={sub.idx}
													className={`${
														styles.subMenu
													} ${
														isSubMenuActive
															? styles.active
															: ""
													}`}
													onClick={(e) => {
														e.stopPropagation();
														onClickSubMenu(
															mainMenu.menuId,
															sub.menuId
														);
														closeMenu();
													}}
												>
													{sub.menuNm}
												</li>
											);
										})}
									</ul>
								</div>
							</li>
						);
					})}
				</ul>
			</nav>
			<div className={styles.menuBarOutside} onClick={closeMenu}></div>
		</div>
	);
}
