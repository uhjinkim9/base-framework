"use client";
import styles from "./styles/AddCustomBoard.module.scss";
import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";

import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";

import {LocalStorage} from "@/util/common/storage";
import {requestPost} from "@/util/api/api-service";
import { SideBarMenuType } from "@/types/menu.type";

export default function AddCustomBoard({closeModal}: {closeModal: () => void}) {
	const userId = LocalStorage.getUserId();
	const [customBoard, setCustomBoard] = useState<SideBarMenuType>({
		menuId: "",
		menuNm: "",
		nodeLevel: 0,
		upperNode: "",
		isCustomed: false,
		isUsed: true,
		memo: "",
		seqNum: 0,
		creatorId: "",
		updaterId: "",
	});
	const mainMenu = usePathname().split("/")[2];
	useEffect(() => {
		setCustomBoard((prev) => ({
			...prev,
			upperBoard: mainMenu,
		}));
	}, [userId]);

	function onToggle(isOn: boolean, name: string) {
		setCustomBoard((prev) => ({
			...prev,
			[name]: isOn ? 1 : 0,
		}));
	}

	function onChangeCustomBoard(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target) {
			const {name, value} = e.target;
			setCustomBoard((prev: any) => ({...prev, [name]: value}));
		}
	}

	const onSubmitBoard = async () => {
		const res = await requestPost("/board/createCustomBoard", customBoard);
		if (res) {
			closeModal();
		}
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.inputGroup}>
				<div className={styles.inputWrapper}>게시판 이름</div>
			</div>
			<div className={styles.toggleGroup}>
				{/* <Toggle
						label="익명 여부"
						onChange={onToggle}
						name="isAnonymous"
					></Toggle>
					<Toggle
						label="댓글 허용 여부"
						onChange={onToggle}
						name="commentAllowed"
					></Toggle>
				</div> */}
				<div className={styles.btnGroup}>
					<CommonButtonGroup
						usedButtons={{
							btnEdit: false,
							btnTempSave: false,
							btnList: false,
							btnCancel: true,
							btnSubmit: true,
						}}
						onSubmit={onSubmitBoard}
						onCancel={closeModal}
					></CommonButtonGroup>
				</div>
			</div>
		</div>
	);
}
