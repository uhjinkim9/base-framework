"use client";
import styles from "../styles/AddMenu.module.scss";
import {ChangeEvent} from "react";

import {RoleType} from "@/types/user-role.type";
import {ModeType} from "@/types/common.type";

import InputBasic from "@/components/common/form-properties/InputBasic";
import SelectBoxBasic from "@/components/common/form-properties/SelectBoxBasic";

export default function AddRole({
	role,
	setRole,
	mode,
}: {
	role: RoleType;
	setRole: React.Dispatch<React.SetStateAction<RoleType>>;
	upperNodes?: RoleType[];
	mode?: ModeType;
}) {
	function onChangeRole(e: ChangeEvent<any>) {
		const {name, value} = e.target;
		setRole((prev: RoleType) => ({...prev, [name]: value}));
	}

	return (
		<>
			<div className={styles.row}>
				<InputBasic
					type="text"
					label="ID"
					onChange={onChangeRole}
					name="roleId"
					value={role?.roleId}
					placeholder="등록 시 수정 불가"
					readOnly={mode === "edit"}
					width="100%"
					allowNegative
				></InputBasic>
			</div>

			<div className={styles.row}>
				<InputBasic
					type="text"
					label="이름"
					onChange={onChangeRole}
					name="roleNm"
					value={role?.roleNm}
					width="100%"
					allowNegative
				></InputBasic>
			</div>

			<div className={styles.row}>
				<InputBasic
					type="text"
					label="메모"
					onChange={onChangeRole}
					name="memo"
					value={role?.memo}
					width="100%"
					allowNegative
				></InputBasic>
			</div>

			<div className={styles.row}>
				<SelectBoxBasic
					name="isUsed"
					value={role?.isUsed}
					label="사용 여부"
					onChange={onChangeRole}
					width="100%"
					codeClass="true-or-false"
				></SelectBoxBasic>
			</div>
		</>
	);
}
