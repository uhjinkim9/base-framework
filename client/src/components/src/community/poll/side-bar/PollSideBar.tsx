"use client";
import styles from "@/components/common/layout/styles/SideBar.module.scss";
import Link from "next/link";
import clsx from "clsx";
import {usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";

import {requestPost} from "@/util/api/api-service";
import {usePollContext} from "@/context/PollContext";
import {SideBarMenuType} from "@/types/menu.type";
import {UrlEnum} from "../etc/url.enum";

import SideBar from "@/components/common/layout/SideBar";
import Divider from "@/components/common/segment/Divider";

export default function PollSideBar() {
	const router = useRouter();
	const pathname = usePathname();
	const pathSegs = pathname.split("/");
	const [_, mainMenu, subMenu, leafMenu, additionalMenu] = pathSegs; // mainMenu: community

	const {pollMenus, setPollMenus, state, dispatch} = usePollContext();

	const getPollMenus = async () => {
		const res = await requestPost("/poll/getPollMenus");
		if (res.statusCode === 200) {
			setPollMenus(res.data);
		}
	};

	useEffect(() => {
		getPollMenus();
	}, []);

	function addNewPoll() {
		dispatch({type: "RESET"});
		dispatch({type: "SET_MODE", payload: "add"});
		router.push(`/${mainMenu}/${subMenu}/${UrlEnum.ADD}`);
	}

	const renderMenuTree = (menu: any) => {
		const isActive = menu?.menuId === leafMenu;

		const menuContentInner = (
			<>
				<div
					className={clsx(
						styles.menuContent,
						menu.nodeLevel === 1 ? styles.nodeFolder : ""
					)}
				>
					<span>{menu.menuNm}</span>
				</div>
			</>
		);
		return (
			<>
				<li
					key={menu.menuIdx}
					className={clsx(
						styles.subMenuItem,
						isActive ? styles.active : ""
					)}
				>
					<div className={styles.menuItemWrapper}>
						{/* poll 페이지의 경우 사이드바 메뉴에 노드 레벨 1인 메뉴가 없음 */}
						<Link href={`/${mainMenu}/${subMenu}/${menu.menuId}`}>
							{menuContentInner}
						</Link>
					</div>
					{menu.children && menu.children.length > 0 && (
						<ul className={styles.subMenuList}>
							{menu.children.map((child: any) => (
								<div
									key={
										child.menuIdx ||
										child.menuId ||
										child.id
									}
								>
									{renderMenuTree(child)}
								</div>
							))}
						</ul>
					)}
				</li>
			</>
		);
	};

	return (
		<SideBar usingPencilBtn onClickPencilBtn={addNewPoll}>
			<div className={styles.menuSection}>
				<ul className={styles.subMenuList}>
					{pollMenus?.map((m: SideBarMenuType) => (
						<div key={m.menuIdx || m.menuId}>
							{renderMenuTree(m)}
						</div>
					))}
				</ul>
				<Divider type="soft" />
			</div>
		</SideBar>
	);
}
