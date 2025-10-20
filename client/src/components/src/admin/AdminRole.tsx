"use client";
import styles from "./styles/Admin.module.scss";
import {useEffect, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";

import {RoleMenuMapType, RoleType} from "@/types/user-role.type";
import {CheckedRowsType} from "./etc/admin-type";
import {NodeLevelType} from "@/types/menu.type";

import {isNotEmpty} from "@/util/validators/check-empty";
import {requestPost} from "@/util/api/api-service";
import {validateRole, validateRoleMenu} from "./etc/validate";

import AlertService from "@/services/alert.service";
import useModal from "@/hooks/useModal";

import Grid from "@/components/common/data-display/Grid";
import Modal from "@/components/common/layout/Modal";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import AddRoleMenu from "./modal/AddRoleMenu";
import AddRole from "./modal/AddRole";

import {
	initialCheckedRowsType,
	newRoleMenuState,
	newRoleState,
} from "./etc/initial-state";
import {
	getFirstRoleColumns,
	getSecondRoleColumns,
} from "./etc/grid-columns/role-column";
import {ModeType} from "@/types/common.type";

export default function AdminRole() {
	const upperModal = useModal();
	const lowerModal = useModal();
	const [data, setData] = useState<RoleType[]>([]);
	const [menuData, setMenuData] = useState<any[]>([]);

	// setRows 분리 함수
	// const setFirstNodes = (forms: FormType[]) => {
	// 	setRows((prev) => ({
	// 		...prev,
	// 		firstNodes: forms,
	// 		secondNodes: prev?.secondNodes || [],
	// 	}));
	// };
	// const setSecondNodes = (ffs: FormFieldType[]) => {
	// 	setRows((prev) => ({
	// 		...prev,
	// 		firstNodes: prev?.firstNodes || [],
	// 		secondNodes: ffs,
	// 	}));
	// };

	// 두 번째 그리드에 렌더링할 때 참고할 데이터
	const [showingLowerRoleId, setShowingLowerRoleId] = useState<string | null>(
		null
	);
	// 그리드에서 선택된 열
	const [checkedRowIds, setCheckedRowIds] = useState<CheckedRowsType>(
		initialCheckedRowsType
	);
	// 추가 시 메뉴 상태
	const [role, setRole] = useState<RoleType>(() => newRoleState());
	const [roleMenu, setRoleMenu] = useState<RoleMenuMapType>(() =>
		newRoleMenuState()
	);
	const [mode, setMode] = useState<ModeType>("view");

	const getRoleMenus = async (roleId: string) => {
		const res = await requestPost("/auth/getRoleMenus", {
			roleId: roleId,
		});
		if (res.statusCode === 200) {
			setMenuData(res.data); // 두 번째 그리드에 바인딩할 데이터
		}
	};

	const onClickLowerMenu = (rowIndex: number, rowData: any) => {
		if (
			isNotEmpty(showingLowerRoleId) &&
			showingLowerRoleId === rowData.roleId
		) {
			setShowingLowerRoleId(null);
			setMenuData([]); // 하위 메뉴 초기화
			return;
		}
		setShowingLowerRoleId(rowData.roleId);
		getRoleMenus(rowData.roleId);
	};

	useEffect(() => {
		if (menuData.length > 0) {
			const reading = new Set<string>();
			const writing = new Set<string>();

			menuData.forEach((row) => {
				const key = `${row.roleId}|${row.menuId}`;
				if (row.roleUser) reading.add(key);
				if (row.roleAdmin) writing.add(key);
			});

			setCheckedRowIds((prev) => ({
				...prev,
				checkedReading: reading,
				checkedWriting: writing,
			}));
		}
	}, [menuData]);

	const handleCheckRow = (
		rowIdx: any,
		rowData: any,
		checked: boolean,
		type: NodeLevelType
	) => {
		const {roleId, menuId} = rowData;

		if (type === "upper") {
			setCheckedRowIds((prev) => {
				const checkedRowSet = new Set(prev.upperCheckedRow);
				checked
					? checkedRowSet.add(roleId)
					: checkedRowSet.delete(roleId);
				return {
					...prev,
					upperCheckedRow: checkedRowSet,
				};
			});
		} else {
			setCheckedRowIds((prev) => {
				const checkedRowSet = new Set(prev.lowerCheckedRow);
				checked
					? checkedRowSet.add(menuId)
					: checkedRowSet.delete(menuId);
				return {
					...prev,
					lowerCheckedRow: checkedRowSet,
				};
			});
		}
	};

	const handleCheckAuth = (
		rowIdx: any,
		rowData: any,
		checked: boolean,
		authType: "reading" | "writing"
	) => {
		const {roleId, menuId} = rowData;
		const setKey = `${roleId}|${menuId}`;

		// UI
		setCheckedRowIds((prev) => {
			const checkedSet = new Set(
				authType === "reading"
					? prev.checkedReading
					: prev.checkedWriting
			);
			checked ? checkedSet.add(setKey) : checkedSet.delete(setKey);

			return {
				...prev,
				[authType === "reading" ? "checkedReading" : "checkedWriting"]:
					checkedSet,
			};
		});

		// 백엔드
		updateRoleMenu({
			[authType === "reading" ? "roleUser" : "roleAdmin"]: checked,
			roleId: roleId,
			menuId: menuId,
		});
	};

	const handleCheckAuthReading = (
		rowIdx: any,
		rowData: any,
		checked: boolean
	) => {
		handleCheckAuth(rowIdx, rowData, checked, "reading");
	};

	const handleCheckAuthWriting = (
		rowIdx: any,
		rowData: any,
		checked: boolean
	) => {
		handleCheckAuth(rowIdx, rowData, checked, "writing");
	};

	async function getUserRoles() {
		const res = await requestPost("/auth/getUserRoles");
		if (res.statusCode === 200) {
			setData(res.data);
		}
	}

	useEffect(() => {
		getUserRoles();
	}, []);

	function openAddingRole(type: NodeLevelType) {
		setMode("add");
		if (type === "upper") {
			setRole(newRoleState());
			upperModal.openModal();
		} else {
			setRoleMenu({
				...newRoleMenuState(),
				roleId: showingLowerRoleId ?? "",
			});
			lowerModal.openModal();
		}
	}

	async function onClickEdit(
		rowIndex: number,
		rowData: any,
		type: NodeLevelType
	) {
		if (type === "upper") {
			const res = await requestPost("/auth/getRole", {
				roleId: rowData.roleId,
			});
			if (res.statusCode === 200) {
				setMode("edit");
				setRole(res.data);
				upperModal.openModal();
			}
		} else {
			const res = await requestPost("/auth/getRoleMenu", {
				roleId: rowData.roleId,
				menuId: rowData.menuId,
			});
			if (res.statusCode === 200) {
				setMode("edit");
				setRoleMenu(res.data);
				lowerModal.openModal();
			}
		}
	}

	async function deleteRole(type: NodeLevelType) {
		if (
			(type === "upper" && checkedRowIds.upperCheckedRow.size === 0) ||
			(type === "lower" && checkedRowIds.lowerCheckedRow.size === 0)
		) {
			AlertService.warn("삭제할 항목을 선택하세요.");
			return;
		}

		AlertService.warn("정말 삭제하시겠습니까?", {
			useConfirmBtn: true,
			useCancelBtn: true,
			onConfirm: () => deleteConfirmed(type),
			onCancel: () => {},
		});
	}

	async function deleteConfirmed(type: NodeLevelType) {
		if (type === "upper") {
			const idList = [...checkedRowIds.upperCheckedRow];
			const res = await requestPost("/auth/deleteRole", {idList});
			if (res.statusCode === 200) {
				AlertService.success("삭제되었습니다.");

				setData((prev) =>
					prev.filter(
						(m) => !checkedRowIds.upperCheckedRow.has(m.roleId)
					)
				);
				setCheckedRowIds(initialCheckedRowsType); // 체크 상태 초기화
			}
		} else {
			const idList = [...checkedRowIds.lowerCheckedRow];
			const res = await requestPost("/auth/deleteRoleMenu", {idList});
			if (res.statusCode === 200) {
				AlertService.success("삭제되었습니다.");
				setCheckedRowIds(initialCheckedRowsType); // 체크 상태 초기화
				getRoleMenus(showingLowerRoleId || "");
			}
		}
	}

	async function createOrUpdateRole() {
		const validationCheck = validateRole(role);
		if (!validationCheck) return;

		const res = await requestPost("/auth/createOrUpdateRole", role);
		if (res.statusCode === 200) {
			const newRole = res.data;
			if (mode === "edit") {
				const updated = data.map((m) => {
					return m.roleId === newRole.roleId ? {...m, ...newRole} : m;
				});
				setData(updated);
			} else {
				setData((prevData) => [...prevData, newRole]);
			}

			// 입력 상태 초기화
			setMode("view");
			setRole(() => newRoleState());
			upperModal.closeModal();
			AlertService.success(
				`역할이 ${mode === "edit" ? "수정" : "등록"}되었습니다.`
			);
		}
	}

	async function createRoleMenu() {
		const validationCheck = validateRoleMenu(roleMenu);
		if (!validationCheck) return;

		const res = await requestPost("/auth/createRoleMenu", roleMenu);
		if (res.statusCode === 200) {
			setMode("view");
			setRoleMenu(() => newRoleMenuState());
			getRoleMenus(roleMenu.roleId);
			lowerModal.closeModal();
			AlertService.success(
				`권한이 ${mode === "edit" ? "수정" : "생성"}되었습니다.`
			);
		} else {
			AlertService.success(
				`권한이 ${mode === "edit" ? "수정" : "생성"}되지 않았습니다.`
			);
		}
	}

	async function updateRoleMenu(params: Partial<RoleMenuMapType>) {
		const res = await requestPost("/auth/updateRoleMenu", params);
		if (res.statusCode === 200) {
			AlertService.success(`권한이 수정되었습니다.`);
		} else {
			AlertService.success(`권한이 수정되지 않았습니다.`);
		}
	}

	const firstColumns = getFirstRoleColumns(
		handleCheckRow,
		checkedRowIds,
		onClickLowerMenu,
		onClickEdit
	);
	const secondColumns = getSecondRoleColumns(
		handleCheckRow,
		handleCheckAuthReading,
		handleCheckAuthWriting,
		checkedRowIds,
		onClickEdit
	);

	const commonGridStructure = (
		type: NodeLevelType,
		mainText: string,
		grid: {data: RoleType[]; columns: ColumnDef<any>[]}
	) => (
		<div className={styles.grid}>
			<div className={styles.gridHeader}>
				<div className="mainText">{mainText}</div>
				<div className={styles.btnGroup}>
					<ButtonBasic
						onClick={() => openAddingRole(type)}
						onHoverOpaque
					>
						행 추가
					</ButtonBasic>
					<ButtonBasic onClick={() => deleteRole(type)} onHoverOpaque>
						행 삭제
					</ButtonBasic>
				</div>
			</div>
			<Grid data={grid.data} columns={grid.columns}></Grid>
		</div>
	);

	return (
		<div className={styles.gridWrapper}>
			{commonGridStructure("upper", "역할", {
				data: data ?? [],
				columns: firstColumns,
			})}

			{showingLowerRoleId &&
				commonGridStructure("lower", "메뉴 매핑", {
					data: menuData,
					columns: secondColumns,
				})}

			<Modal
				modalConfig={upperModal.modalConfig}
				closeModal={upperModal.closeModal}
				modalTitle={"역할 추가"}
				width={"30vw"}
				height={"35vh"}
				footerContent={
					<CommonButtonGroup
						usedButtons={{btnSubmit: true}}
						onSubmit={createOrUpdateRole}
						submitBtnLabel={mode === "edit" ? "수정" : "등록"}
					/>
				}
			>
				<AddRole role={role} setRole={setRole} mode={mode} />
			</Modal>

			<Modal
				modalConfig={lowerModal.modalConfig}
				closeModal={lowerModal.closeModal}
				modalTitle={"메뉴 접근 권한 할당"}
				width={"30vw"}
				height={"35vh"}
				footerContent={
					<CommonButtonGroup
						usedButtons={{btnSubmit: true}}
						onSubmit={createRoleMenu}
						submitBtnLabel={mode === "edit" ? "수정" : "등록"}
					/>
				}
			>
				<AddRoleMenu roleMenu={roleMenu} setRoleMenu={setRoleMenu} />
			</Modal>
		</div>
	);
}
