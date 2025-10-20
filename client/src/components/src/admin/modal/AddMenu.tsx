"use client";
import styles from "../styles/AddMenu.module.scss";
import {ChangeEvent, useEffect, useState} from "react";

import {MenuType, SideBarMenuType} from "@/types/menu.type";
import {ModeType, SelectOptionType} from "@/types/common.type";

import InputBasic from "@/components/common/form-properties/InputBasic";
import SelectBoxBasic from "@/components/common/form-properties/SelectBoxBasic";

export default function AddMenu({
	menu,
	setMenu,
	upperNodes,
	mode,
}: {
	menu: MenuType;
	setMenu: React.Dispatch<React.SetStateAction<MenuType>>;
	upperNodes?: MenuType[] | SideBarMenuType[];
	mode?: ModeType;
}) {
	function onChangeMenu(e: ChangeEvent<any>) {
		const {name, value} = e.target;
		setMenu((prev: MenuType) => ({...prev, [name]: value}));
	}

	const [upperNodeMap, setUpperNodeMap] = useState<SelectOptionType[]>();

	useEffect(() => {
		const firstNodesMap = upperNodes?.map((n) => ({
			label: n.menuNm,
			value: n.menuId,
		}));
		setUpperNodeMap(firstNodesMap);
	}, []);

	return (
		<>
			<div className={styles.row}>
				<SelectBoxBasic
					name="nodeLevel"
					value={menu?.nodeLevel}
					label="레벨"
					onChange={onChangeMenu}
					width="100%"
					codeClass="node-level"
				></SelectBoxBasic>
				<SelectBoxBasic
					name="upperNode"
					value={menu?.upperNode}
					label="상위 노드"
					onChange={onChangeMenu}
					width="100%"
					customOptions={upperNodeMap}
				></SelectBoxBasic>
			</div>

			<div className={styles.row}>
				<InputBasic
					type="text"
					label="ID"
					onChange={onChangeMenu}
					name="menuId"
					value={menu?.menuId}
					placeholder="등록 시 수정 불가"
					readOnly={mode === "edit"}
					width="100%"
					allowNegative
				></InputBasic>
				<InputBasic
					type="text"
					label="이름"
					onChange={onChangeMenu}
					name="menuNm"
					value={menu?.menuNm}
					width="100%"
					allowNegative
				></InputBasic>
			</div>

			<div className={styles.row}>
				<InputBasic
					type="text"
					label="메모"
					onChange={onChangeMenu}
					name="memo"
					value={menu?.memo}
					width="100%"
					allowNegative
				></InputBasic>
				<InputBasic
					type="number"
					label="순서"
					onChange={onChangeMenu}
					name="seqNum"
					value={menu?.seqNum}
					width="100%"
				></InputBasic>
			</div>

			<div className={styles.row}>
				<SelectBoxBasic
					name="isUsed"
					value={menu?.isUsed}
					label="사용 여부"
					onChange={onChangeMenu}
					width="100%"
					codeClass="true-or-false"
				></SelectBoxBasic>
			</div>
		</>
	);
}
