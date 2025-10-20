"use client";
import styles from "../styles/AddMenu.module.scss";
import {ChangeEvent, useEffect, useState} from "react";

import {useMenuData} from "@/context/MenuContext";
import {SelectOptionType} from "@/components/common/form-properties/types/common.type";
import {RoleMenuMapType} from "@/types/user-role.type";
import {MenuType} from "@/types/menu.type";

import InputBasic from "@/components/common/form-properties/InputBasic";
import SelectBoxBasic from "@/components/common/form-properties/SelectBoxBasic";

export default function AddRoleMenu({
	roleMenu,
	setRoleMenu,
}: {
	roleMenu: RoleMenuMapType;
	setRoleMenu: React.Dispatch<React.SetStateAction<RoleMenuMapType>>;
}) {
	const {menuData} = useMenuData();
	const [menuMap, setMenuMap] = useState<SelectOptionType[]>();

	const onChangeRoleMenu = (e: ChangeEvent<any>) => {
		const {name, value} = e.target;
		setRoleMenu((prev: RoleMenuMapType) => ({...prev, [name]: value}));
	};

	useEffect(() => {
		const menuSelectingOpts = menuData
			?.filter((m) => m.nodeLevel === 2)
			.map((n: MenuType) => ({
				label: n.menuNm,
				value: n.menuId,
			}));
		setMenuMap(menuSelectingOpts);
	}, []);

	return (
		<>
			<div className={styles.row}>
				<InputBasic
					name="roleId"
					value={roleMenu?.roleId}
					label="역할 ID"
					onChange={onChangeRoleMenu}
					width="100%"
					readOnly
				></InputBasic>
			</div>

			<div className={styles.row}>
				<SelectBoxBasic
					name="menuId"
					value={roleMenu?.menuId}
					label="메뉴 ID"
					onChange={onChangeRoleMenu}
					width="100%"
					customOptions={menuMap}
				></SelectBoxBasic>
			</div>

			<div className={styles.row}>
				<SelectBoxBasic
					name="isUsed"
					value={roleMenu?.isUsed}
					label="사용 여부"
					onChange={onChangeRoleMenu}
					width="100%"
					codeClass="true-or-false"
				></SelectBoxBasic>
			</div>
		</>
	);
}
