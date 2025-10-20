"use client";
import styles from "./styles/Admin.module.scss";
import {useEffect, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";

import {RoleType} from "@/types/user-role.type";
import {UserType} from "@/types/user.type";
import {SelectOptionType} from "@/types/common.type";
import {getUserColumn} from "./etc/grid-columns/user-column";
import {validateRoleAssignment} from "./etc/validate";

import {requestPost} from "@/util/api/api-service";
import AlertService from "@/services/alert.service";

import Grid from "@/components/common/data-display/Grid";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import SelectBoxBasic from "@/components/common/form-properties/SelectBoxBasic";

export default function AdminAssignRole() {
	const [data, setData] = useState<UserType[]>([]);

	// 그리드에서 선택된 열
	const [checkedRowIds, setCheckedRowIds] = useState<Set<string>>(new Set());
	// 역할 셀렉트박스 옵션
	const [roleOpts, setRoleOpts] = useState<SelectOptionType[]>([]);
	const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

	const handleCheckRow = (rowIdx: any, rowData: any, checked: boolean) => {
		const {userId} = rowData;
		setCheckedRowIds((prev) => {
			const newSet = new Set(prev);
			checked ? newSet.add(userId) : newSet.delete(userId);
			return newSet;
		});
	};

	async function getUsers() {
		const res = await requestPost("/auth/getUsers");
		if (res.statusCode === 200) {
			setData(res.data);
		}
	}

	// 역할 옵션을 가져와서 설정
	const onOpenSelectRole = async () => {
		const res = await requestPost("/auth/getUserRoles");
		if (res.statusCode === 200) {
			const roles = res.data;
			const options = roles.map((role: RoleType) => ({
				label: role.roleNm,
				value: role.roleId,
			}));
			setRoleOpts(options);
		}
	};

	useEffect(() => {
		Promise.all([getUsers(), onOpenSelectRole()]);
	}, []);

	const assignRoleToUsers = async () => {
		const validationCheck = validateRoleAssignment(selectedRoleId ?? "");
		if (!validationCheck) return;

		const res = await requestPost("/auth/updateUserRole", {
			roleId: selectedRoleId,
			userIds: Array.from(checkedRowIds),
		});
		if (res.statusCode === 200) {
			AlertService.success(`역할이 수정되었습니다.`);
			// 응답 데이터로 해당 행들만 업데이트
			setData((prevData) =>
				prevData.map((user) => {
					const updatedUser = res.data.find(
						(updated: UserType) => updated.userId === user.userId
					);
					return updatedUser ? updatedUser : user;
				})
			);
			setCheckedRowIds(new Set());
		}
	};

	const firstColumns = getUserColumn(handleCheckRow, checkedRowIds);

	const commonGridStructure = (
		mainText: string,
		grid: {data: UserType[]; columns: ColumnDef<any>[]}
	) => (
		<div className={styles.grid}>
			<div className={styles.gridHeader}>
				<div className="mainText">{mainText}</div>
				<div className={styles.btnGroup}>
					<SelectBoxBasic
						name="roleId"
						value={selectedRoleId}
						customOptions={roleOpts}
						onChange={(event) =>
							setSelectedRoleId(event.target.value)
						}
						defaultLabel="역할"
					></SelectBoxBasic>
					<ButtonBasic onClick={assignRoleToUsers}>
						역할 할당
					</ButtonBasic>
				</div>
			</div>
			<Grid data={grid.data} columns={grid.columns}></Grid>
		</div>
	);

	return (
		<div className={styles.gridWrapper}>
			{commonGridStructure("역할", {
				data: data ?? [],
				columns: firstColumns,
			})}
		</div>
	);
}
