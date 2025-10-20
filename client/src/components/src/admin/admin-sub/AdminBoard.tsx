"use client";
import styles from "../styles/Admin.module.scss";
import {useEffect, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";

import {MenuType, NodeLevelType, SideBarMenuType} from "@/types/menu.type";
import {AdminBoardGridType, BoardMenuCheckedItemType} from "../etc/admin-type";

import {requestPost} from "@/util/api/api-service";
import {newMenuState} from "../etc/initial-state";

import AlertService from "@/services/alert.service";
import useModal from "@/hooks/useModal";
import Grid from "@/components/common/data-display/Grid";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import {
  getFirstBoardMenuColumns,
  getSecondBoardMenuColumns,
} from "../etc/grid-columns/each-menu-column";
import {BoardSettingType} from "../../community/board/etc/board.type";
import Modal from "@/components/common/layout/Modal";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import AddMenu from "../modal/AddMenu";
import {ModeType} from "@/types/common.type";

export default function AdminBoard() {
  const {openModal, closeModal, modalConfig} = useModal();
  const [rows, setRows] = useState<AdminBoardGridType>({
    firstNodes: [],
    secondNodes: [],
  });
  const [checkedRowIds, setCheckedRowIds] = useState<BoardMenuCheckedItemType>({
    checkedUsingPrefix: new Set(),
    checkedAllowedCmt: new Set(),
    checkedIsAnonymous: new Set(),
  });

  // 추가 시 메뉴 상태
  const [menu, setMenu] = useState<MenuType>(() => newMenuState());
  const [mode, setMode] = useState<ModeType>("view");

  const handleCheckRow = (rowIdx: number, rowData: any, checked: boolean) => {
    const menuId = rowData.menuId;
    setCheckedRowIds((prev) => {
      const newSet = new Set(prev.checkedUsingPrefix);
      if (checked) {
        newSet.add(menuId);
      } else {
        newSet.delete(menuId);
      }
      return {
        ...prev,
        checkedUsingPrefix: newSet,
      };
    });
  };

  const setFirstNodeMenus = (menus: SideBarMenuType[]) => {
    setRows((prev) => ({
      ...prev,
      firstNodes: menus,
      secondNodes: prev?.secondNodes || [],
    }));
  };
  const setSecondNodeMenus = (menus: BoardSettingType[]) => {
    setRows((prev) => ({
      ...prev,
      firstNodes: prev?.firstNodes || [],
      secondNodes: menus,
    }));
  };

  async function getBoardMenus() {
    const res = await requestPost("/board/getBoardMenus");
    if (res.statusCode === 200) {
      const firstNodes = res.data.cpBoards?.filter(
        (d: any) => !d.menuId.includes("all") && !d.menuId.includes("mine"),
      );
      setFirstNodeMenus(firstNodes);
    }
  }
  const getBoardSetting = async () => {
    const res = await requestPost("/board/getBoardSetting");
    if (res.statusCode === 200) {
      setSecondNodeMenus(res.data);
    }
  };

  useEffect(() => {
    Promise.all([getBoardMenus(), getBoardSetting()]);
  }, []);

  //TODO
  function openAddingMenu(type: NodeLevelType) {
    setMode("add");
    // setMenu(newMenuState(type, showingLowerId ?? ""));
    openModal();
  }

  // 게시판 하나 가져오기
  async function onClickEdit(rowIndex: number, rowData: any) {
    const res = await requestPost("/board/getBoard", {
      menuId: rowData.menuId,
    });
    if (res.statusCode === 200) {
      setMode("edit");
      setMenu(res.data);
      openModal();
    }
  }

  //TODO
  async function deleteMenu() {
    // if (checkedRowIds.size === 0) {
    // 	AlertService.warn("삭제할 항목을 선택하세요.");
    // 	return;
    // }
    AlertService.warn("선택된 모든 메뉴가 삭제됩니다. 삭제하시겠습니까?", {
      useConfirmBtn: true,
      useCancelBtn: true,
      onConfirm: () => deleteConfirmed(),
      onCancel: () => {},
    });
  }

  //TODO
  async function deleteConfirmed() {
    // const idList = [...checkedRowIds]; // params
    // const res = await requestPost("/menu/deleteMenu", {idList});
    // if (res.statusCode === 200) {
    // 	AlertService.success("삭제되었습니다.");
    // 	// 선택된 row 삭제
    // 	setRows((prev) =>
    // 		prev?.filter((m) => !checkedRowIds.has(m.menuId))
    // 	);
    // 	setCheckedRowIds(new Set()); // 체크 상태 초기화
    // }
  }

  //TODO
  async function createOrUpdateBoard() {
    // const validationCheck = validateMenu(menu);
    // if (!validationCheck) return;

    const res = await requestPost("/board/createOrUpdateBoard", menu);
    if (res.statusCode === 200) {
      const newMenu = res.data;
      // if (mode === "edit") {
      // 	const updated = rows?.map((m) => {
      // 		return m.menuId === newMenu.menuId ? {...m, ...newMenu} : m;
      // 	});
      // 	setRows(updated);
      // } else {
      // 	setRows((prevData) => [...(prevData || []), newMenu]);
      // }

      // 입력 상태 초기화
      setMode("view");
      // setMenu(() => newMenuState("upper", ""));
      closeModal();
      AlertService.success(
        `메뉴가 ${mode === "edit" ? "수정" : "등록"}되었습니다.`,
      );
    }
  }

  const handleCheckByType = (
    rowIdx: any,
    rowData: any,
    checked: boolean,
    type: "usingPrefix" | "allowedCmt" | "isAnonymous",
  ) => {
    const {roleId, menuId} = rowData;
    const setKey = `${roleId}|${menuId}`;

    // UI
    setCheckedRowIds((prev) => {
      const checkedSet = new Set(
        type === "usingPrefix"
          ? prev.checkedUsingPrefix
          : type === "allowedCmt"
          ? prev.checkedAllowedCmt
          : prev.checkedIsAnonymous,
      );
      checked ? checkedSet.add(setKey) : checkedSet.delete(setKey);

      return {
        ...prev,
        [type === "usingPrefix"
          ? "checkedUsingPrefix"
          : type === "allowedCmt"
          ? "checkedAllowedCmt"
          : "checkedIsAnonymous"]: checkedSet,
      };
    });

    // 백엔드
    // updateBoardMenu({
    // 	[authType === "usingPrefix" ? "roleUser" : "roleAdmin"]: checked,
    // 	roleId: roleId,
    // 	menuId: menuId,
    // });
  };

  const handleCheckUsingPrefix = (
    rowIdx: any,
    rowData: any,
    checked: boolean,
  ) => {
    handleCheckByType(rowIdx, rowData, checked, "usingPrefix");
  };
  const handleCheckAllowedCmt = (
    rowIdx: any,
    rowData: any,
    checked: boolean,
  ) => {
    handleCheckByType(rowIdx, rowData, checked, "allowedCmt");
  };
  const handleCheckIsAnonymous = (
    rowIdx: any,
    rowData: any,
    checked: boolean,
  ) => {
    handleCheckByType(rowIdx, rowData, checked, "isAnonymous");
  };

  const firstColumns = getFirstBoardMenuColumns(
    handleCheckRow,
    checkedRowIds,
    onClickEdit,
  );
  const secondColumns = getSecondBoardMenuColumns(
    handleCheckRow,
    checkedRowIds,
    onClickEdit,
    handleCheckByType,
  );

  const commonGridStructure = (
    type: NodeLevelType,
    mainText: string,
    grid: {data: any[]; columns: ColumnDef<any>[]},
  ) => (
    <div className={styles.grid}>
      <div className={styles.gridHeader}>
        <div className="mainText">{mainText}</div>
        <div className={styles.btnGroup}>
          <ButtonBasic onClick={() => openAddingMenu(type)} onHoverOpaque>
            행 추가
          </ButtonBasic>
          <ButtonBasic onClick={deleteMenu} onHoverOpaque>
            행 삭제
          </ButtonBasic>
        </div>
      </div>
      <Grid data={grid.data} columns={grid.columns}></Grid>
    </div>
  );

  return (
    <div className={styles.gridWrapper}>
      {commonGridStructure("upper", "전사 게시판", {
        data: rows.firstNodes,
        columns: firstColumns,
      })}

      {commonGridStructure("lower", "세부 권한 설정", {
        data: rows.secondNodes,
        columns: secondColumns,
      })}

      <Modal
        modalConfig={modalConfig}
        closeModal={closeModal}
        modalTitle={"게시판 설정"}
        width={"30vw"}
        height={"35vh"}
        footerContent={
          <CommonButtonGroup
            usedButtons={{btnSubmit: true}}
            onSubmit={createOrUpdateBoard}
            submitBtnLabel={mode === "edit" ? "수정" : "등록"}
          />
        }
      >
        <AddMenu
          menu={menu}
          setMenu={setMenu}
          upperNodes={rows?.firstNodes}
          mode={mode}
        />
      </Modal>
    </div>
  );
}
