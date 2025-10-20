"use client";
import styles from "@/components/common/layout/styles/SideBar.module.scss";
import {usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";
import Link from "next/link";
import clsx from "clsx";

import {LocalStorage} from "@/util/common/storage";
import {requestPost} from "@/util/api/api-service";
import {useDocsContext} from "@/context/DocsContext";
import {SideBarMenuType} from "@/types/menu.type";
import {ProofUrlEnum} from "../etc/url.enum";

import SideBar from "@/components/common/layout/SideBar";
import Divider from "@/components/common/segment/Divider";
import useModal from "@/hooks/useModal";
import Modal from "@/components/common/layout/Modal";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import AddDoc from "../modal/AddDoc";

export default function DocsSideBar() {
	const userId = LocalStorage.getUserId();
	const {docsMenus, setDocsMenus, docDispatch} = useDocsContext();
	const {openModal, closeModal, modalConfig} = useModal();

	const router = useRouter();
	const pathname = usePathname();
	const pathSegs = pathname.split("/");
	const [_, mainMenu, subMenu, leafMenu, additionalMenu] = pathSegs; // mainMenu: docs, subMenu: proof

	async function getDocsMenus() {
		if (!userId) return;
		const res = await requestPost("/docs/getDocsMenus", {
			upperNode: subMenu,
		});
		if (res.statusCode === 200) {
			setDocsMenus(res.data);
		}
	}
	useEffect(() => {
		getDocsMenus();
	}, []);

	const addNewProof = () => {
		router.push(`/${mainMenu}/${subMenu}/${ProofUrlEnum.ADD}`);
		closeModal();
		docDispatch({type: "SET_MODE", payload: "add"});
	};

	const onClickAdd = () => {
		docDispatch({type: "RESET"});
		openModal();
	};

	const renderMenuTree = (menu: any) => {
		const isActive = menu?.menuId === additionalMenu;

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
						<Link
							href={`/${mainMenu}/${subMenu}/${menu.upperNode}/${menu.menuId}`}
						>
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
		<>
			<SideBar usingPencilBtn onClickPencilBtn={onClickAdd}>
				<div className={styles.menuSection}>
					<ul className={styles.subMenuList}>
						{docsMenus?.map((m: SideBarMenuType) => (
							<div key={m.menuIdx || m.menuId}>
								{renderMenuTree(m)}
							</div>
						))}
					</ul>
					<Divider type="soft" />
				</div>
			</SideBar>

			<Modal
				modalConfig={modalConfig}
				closeModal={closeModal}
				modalTitle={"증명서 신청"}
				width={"20vw"}
				height={"30vh"}
				footerContent={
					<CommonButtonGroup
						usedButtons={{btnSubmit: true}}
						onSubmit={addNewProof}
						submitBtnLabel={"계속"}
					/>
				}
			>
				<AddDoc />
			</Modal>
		</>
	);
}
