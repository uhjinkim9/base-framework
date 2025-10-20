"use client";
import clsx from "clsx";
import styles from "./styles/ManageHeaderMenu.module.scss";
import AlertService from "@/services/alert.service";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import CheckBox from "@/components/common/form-properties/CheckBox";
import HeaderMenuListLine from "./inner/HeaderMenuListLine";
import IconNode from "@/components/common/segment/IconNode";
import Divider from "@/components/common/segment/Divider";

import {useEffect, useState, memo, useCallback} from "react";
import {MenuType} from "@/types/menu.type";
import {useMenuData} from "@/context/MenuContext";
import {ModeType} from "@/types/common.type";
import {requestPost} from "@/util/api/api-service";
import Tabs from "@/components/common/layout/Tabs";

const ListHeader = memo(
  ({
    onSelectAll,
    isAllSelected,
  }: {
    onSelectAll?: () => void;
    isAllSelected?: boolean;
  }) => (
    <div className={clsx(styles.lineWrapper, styles.headerRow)}>
      <div className={styles.check}>
        <CheckBox
          componentType="orange"
          value={isAllSelected}
          onChange={onSelectAll}
        />
      </div>
      <div className={styles.menuId}>메뉴 ID</div>
      <div className={styles.menuNm}>메뉴명</div>
      <div className={styles.isUsed}>사용</div>
      <div className={styles.seqNum}>순서</div>
      <div className={styles.editBtn}>수정</div>
    </div>
  ),
);

// 개별 그룹 행 컴포넌트 (성능 최적화용)
const ListLine = memo(
  ({
    menu,
    menuIdx,
    isSelected,
    mode,
    setMode,
    editingMenuIdx,
    selectedGroups,
    onClickEdit,
    onCheck,
    onChangeEditingGroup,
    handleKeyDown,
    handleSaveEdit,
    handleMenuSelect,
  }: {
    menu: MenuType;
    menuIdx: number;
    isSelected: boolean;
    mode: ModeType;
    setMode: (mode: ModeType) => void;
    editingMenuIdx: number | null;
    selectedGroups: Set<number>;
    onClickEdit: (groupIdx: number) => void;
    onCheck: (groupIdx: number) => void;
    onChangeEditingGroup: (e: React.ChangeEvent<any>, groupIdx: number) => void;
    handleKeyDown: (
      e: React.KeyboardEvent<HTMLInputElement>,
      menuIdx: number,
    ) => void;
    handleSaveEdit: (menuId: string) => void;
    handleMenuSelect?: (menuId: string) => void;
  }) => (
    <div
      className={clsx(
        styles.groupRow,
        handleMenuSelect && styles.pointer,
        isSelected && styles.selectedRow,
      )}
      onClick={() => handleMenuSelect?.(menu.menuId)}
    >
      <HeaderMenuListLine
        onClickEdit={() => onClickEdit(menuIdx)}
        data={menu}
        mode={mode}
        setMode={setMode}
        isEditingThis={editingMenuIdx === menu.idx}
        isSelected={selectedGroups.has(menuIdx)}
        onCheck={() => onCheck(menuIdx)}
        onChangeEditing={(e: React.ChangeEvent<any>) =>
          onChangeEditingGroup(e, menuIdx)
        }
        handleKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
          handleKeyDown(e, menuIdx)
        }
        handleSaveEdit={() => handleSaveEdit(menu.menuId)}
      />
    </div>
  ),
);

export default function ManageUser() {
  // 메뉴
  const {menuData, refreshMenu, filterFirstNodes, filterSecondNodes} =
    useMenuData();
  const [menus, setMenus] = useState<{
    upperMenu: MenuType[];
    lowerMenu: MenuType[];
  } | null>(null);

  // upperMenu만 업데이트
  const setUpperMenu = useCallback(
    (updater: (prev: MenuType[]) => MenuType[]) => {
      setMenus((prev) => {
        if (!prev) return {upperMenu: updater([]), lowerMenu: []};
        return {...prev, upperMenu: updater(prev.upperMenu)};
      });
    },
    [],
  );
  // lowerMenu만 업데이트
  const setLowerMenu = useCallback(
    (updater: (prev: MenuType[]) => MenuType[]) => {
      setMenus((prev) => {
        if (!prev) return {upperMenu: [], lowerMenu: updater([])};
        return {...prev, lowerMenu: updater(prev.lowerMenu)};
      });
    },
    [],
  );

  const [mode, setMode] = useState<ModeType>("view");
  const [editingMenuIdx, setEditingMenuIdx] = useState<number | null>(null);
  const [selectedMenus, setSelectedMenus] = useState<Set<number>>(new Set());

  // 선택된 메뉴와 하위 메뉴(id로 매핑)
  const [showingLowerId, setShowingLowerId] = useState<string | null>(null);

  const initializeMenuState = () => {
    const firstNodes = filterFirstNodes(menuData);
    setMenus((prev) => ({
      upperMenu: firstNodes,
      lowerMenu: prev?.lowerMenu || [],
    }));
  };

  useEffect(() => {
    initializeMenuState();
  }, [menuData]);

  const onChangeEditingMenu = useCallback(
    (e: React.ChangeEvent<any>, idx: number, target: "upper" | "lower") => {
      const {name, value} = e.target;

      const updater = (menus: MenuType[]) => {
        const index = menus.findIndex((m) => m.idx === idx);
        if (index === -1) return menus;
        const newMenus = [...menus];
        newMenus[index] = {...newMenus[index], [name]: value};
        return newMenus;
      };

      if (target === "upper") setUpperMenu(updater);
      else setLowerMenu(updater);
    },
    [setUpperMenu, setLowerMenu],
  );
  const onChangeEditingUpper = useCallback(
    (e: React.ChangeEvent<any>, idx: number) =>
      onChangeEditingMenu(e, idx, "upper"),
    [onChangeEditingMenu],
  );
  const onChangeEditingLower = useCallback(
    (e: React.ChangeEvent<any>, idx: number) =>
      onChangeEditingMenu(e, idx, "lower"),
    [onChangeEditingMenu],
  );

  useEffect(() => {
    console.log("menus.upperMenu", menus?.upperMenu);
  }, [menus?.upperMenu]);

  const setLowerMenus = async (menuId: string) => {
    const secondNodes = filterSecondNodes(menuId ?? "");
    setMenus((prev) => ({
      upperMenu: prev?.upperMenu || [],
      lowerMenu: secondNodes,
    }));
  };

  // 메뉴 행 클릭 핸들러
  const handleMenuSelect = (menuId: string) => {
    setShowingLowerId(menuId);
    setLowerMenus(menuId);
  };

  // 메뉴 추가 핸들러
  const addMenu = async (type: "upper" | "lower") => {
    const isUpper = type === "upper";
    try {
      const params = {
        menuNm: "새 그룹",
        nodeLevel: isUpper ? 1 : 2,
        upperNode: isUpper ? null : showingLowerId,
      };
      const res = await requestPost("/menu/insertMenu", params);
      if (res.statusCode === 200) {
        if (isUpper) {
          setUpperMenu((prev) => (prev ? [...prev, res.data] : [res.data]));
        } else {
          setLowerMenu((prev) => (prev ? [...prev, res.data] : [res.data]));
        }
        AlertService.success(res.message);
      } else {
        AlertService.error(
          `헤더 메뉴 생성에 실패했습니다: ${res.message || "알 수 없는 오류"}`,
        );
      }
    } catch (error) {
      console.error("addMenu 에러:", error);
      AlertService.error("헤더 메뉴 생성 중 오류가 발생했습니다.");
    }
  };
  const addUpper = useCallback(() => addMenu("upper"), [addMenu]);
  const addLower = useCallback(() => addMenu("lower"), [addMenu]);

  const onClickEdit = useCallback((idx: number) => {
    setMode("edit");
    setEditingMenuIdx(idx);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    try {
      const editingMenu =
        menus?.upperMenu.find((p) => p.idx === editingMenuIdx) ||
        menus?.lowerMenu.find((p) => p.idx === editingMenuIdx);
      if (!editingMenu) return;

      const requestData = {
        idx: editingMenu.idx,
        ...editingMenu,
      };
      const res = await requestPost("/menu/updateMenu", requestData);
      if (res.statusCode === 200) {
        AlertService.success(res.message);
        setMode("view");
        setEditingMenuIdx(null);
      } else {
        AlertService.error(
          `메뉴 변경에 실패했습니다: ${res.message || "알 수 없는 오류"}`,
        );
      }
    } catch (error) {
      console.error("handleSaveEdit 에러:", error);
      AlertService.error("정책 변경 중 오류가 발생했습니다.");
    }
  }, [menus]);

  const handleCancelEdit = useCallback(() => {
    setMode("view");
    setEditingMenuIdx(null);
    initializeMenuState(); // 원래 데이터로 되돌리기
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSaveEdit();
      } else if (e.key === "Escape") {
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit],
  );

  const onClickBulkDelete = async (type: "upper" | "lower") => {
    const isUpper = type === "upper";
    if (selectedMenus.size === 0) {
      AlertService.error("선택된 메뉴가 없습니다.");
      return;
    }
    const executeDeletion = async () => {
      try {
        const requestData = {
          menuIdxs: Array.from(selectedMenus),
          nodeLevel: isUpper ? 1 : 2,
        };
        const res = await requestPost("/menu/deleteBulkMenu", requestData);
        if (res.statusCode === 200) {
          AlertService.success(
            `${selectedMenus.size}개의 ${
              isUpper ? "상위 메뉴" : "하위 메뉴"
            } 삭제되었습니다.`,
          );
          refreshMenu();
          setSelectedMenus(new Set());
        } else {
          AlertService.error(
            `${isUpper ? "상위 메뉴" : "하위 메뉴"} 삭제에 실패했습니다.`,
          );
          console.error("삭제 실패:", res);
        }
      } catch (error) {
        console.error("삭제 API 호출 오류:", error);
        AlertService.error("정책 삭제 중 오류가 발생했습니다.");
      }
    };
    AlertService.warn(
      `선택된 ${selectedMenus.size}개의 ${
        isUpper ? "상위 메뉴" : "하위 메뉴"
      }을 삭제하시겠습니까?`,
      {
        useConfirmBtn: true,
        useCancelBtn: true,
        onConfirm: () => executeDeletion(),
        onCancel: () => {
          return;
        },
      },
    );
  };
  const deleteBulkUpper = useCallback(
    () => onClickBulkDelete("upper"),
    [onClickBulkDelete],
  );
  const deleteBulkLower = useCallback(
    () => onClickBulkDelete("lower"),
    [onClickBulkDelete],
  );

  const handleSelectAll = (type: "upper" | "lower") => {
    const isUpper = type === "upper";
    const rows = isUpper ? menus?.upperMenu : menus?.lowerMenu;
    const allIds = rows?.map((menu) => menu.idx || 0).filter((idx) => idx);

    const newSelected =
      selectedMenus.size === allIds?.length
        ? new Set<number>()
        : new Set(allIds);
    setSelectedMenus(newSelected);
  };
  const handleSelectUpper = useCallback(
    () => handleSelectAll("upper"),
    [handleSelectAll],
  );
  const handleSelectLower = useCallback(
    () => handleSelectAll("lower"),
    [handleSelectAll],
  );

  const onCheck = useCallback((menuIdx: number) => {
    setSelectedMenus((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(menuIdx)) {
        newSelected.delete(menuIdx);
      } else {
        newSelected.add(menuIdx);
      }
      return newSelected;
    });
  }, []);

  const isUpperAllSelected = Boolean(
    menus &&
      menus.upperMenu?.length > 0 &&
      selectedMenus.size === menus.upperMenu?.length,
  );
  const isLowerAllSelected = Boolean(
    menus &&
      menus.lowerMenu?.length > 0 &&
      selectedMenus.size === menus.lowerMenu?.length,
  );

  return (
    <>
      <div className={styles.listWrapper}>
        <h3 className={styles.mainText}>사용자 관리</h3>
        <Tabs
          tabs={[
            <span className={styles.label}>사용자 생성</span>,
            <span className={styles.label}>메일함 관리</span>,
          ]}
          contents={[
            <>
              <p className={styles.subTextRed}>사용자 ㅇ</p>
            </>,
            <>아직 구현 전</>,
          ]}
        />

        {/* 상위 메뉴 목록 */}
        {/* <div className={styles.listContainer}>
          <h3 className={styles.mainText}>
            사용자 관리
            <p className={styles.subTextRed}>
              * 새로운 메뉴 생성 시 메뉴 ID는 최초 1회만 수정 가능합니다. (URL에
              사용)
            </p>
          </h3>

          <div className={styles.listHeader}>
            <div className={clsx(styles.row, styles.gap1rem)}>
              <div className={styles.inRowGroup}>
                <ButtonBasic
                  componentType="grayBorder"
                  width="4rem"
                  disabled={selectedMenus.size === 0}
                  onClick={deleteBulkUpper}
                >
                  삭제
                </ButtonBasic>
              </div>
            </div>
          </div>

          <ListHeader
            onSelectAll={handleSelectUpper}
            isAllSelected={isUpperAllSelected || false}
          />
          {menus && menus.upperMenu?.length > 0 ? (
            menus?.upperMenu?.map((menu: MenuType) => {
              const isSelected = showingLowerId === menu.menuId;
              const menuIdx = menu.idx || 0;

              return (
                <ListLine
                  key={menuIdx}
                  menu={menu}
                  menuIdx={menuIdx}
                  isSelected={isSelected}
                  mode={mode}
                  setMode={setMode}
                  editingMenuIdx={editingMenuIdx}
                  selectedGroups={selectedMenus}
                  onClickEdit={onClickEdit}
                  onCheck={onCheck}
                  onChangeEditingGroup={onChangeEditingUpper}
                  handleKeyDown={handleKeyDown}
                  handleSaveEdit={handleSaveEdit}
                  handleMenuSelect={handleMenuSelect}
                />
              );
            })
          ) : (
            <div className={styles.emptyList}>상위 메뉴가 없습니다.</div>
          )}
          <Divider type="none" />
          <IconNode
            cursorPointer
            onClick={addUpper}
            iconName="circlePlus"
            size={30}
            color="gray4"
            padding="1rem"
          />
        </div> */}

        {/* <Divider type="middle" /> */}

        {/* 하위 메뉴 목록 표시 */}
        {/* <div className={styles.listContainer}>
          <h3 className={styles.mainText}>
            헤더 Depth 2 메뉴
            {showingLowerId && (
              <p className={styles.subTextGray}>
                {`✅ 선택된 상위 메뉴: 
                ${
                  menus?.upperMenu?.find((m) => m.menuId === showingLowerId)
                    ?.menuNm
                }`}
              </p>
            )}
          </h3>

          {showingLowerId ? (
            <>
              <div className={styles.listHeader}>
                <div className={clsx(styles.row, styles.gap1rem)}>
                  <div className={styles.inRowGroup}>
                    <ButtonBasic
                      componentType="grayBorder"
                      width="4rem"
                      disabled={selectedMenus.size === 0}
                      onClick={deleteBulkLower}
                    >
                      삭제
                    </ButtonBasic>
                  </div>
                </div>
              </div>

              <div className={clsx(styles.lineWrapper, styles.headerRow)}>
                <div className={styles.check}>
                  <CheckBox
                    componentType="orange"
                    value={isLowerAllSelected}
                    onChange={handleSelectLower}
                  />
                </div>
                <div className={styles.menuId}>메뉴 ID</div>
                <div className={styles.menuNm}>메뉴명</div>
                <div className={styles.upperNode}>상위 ID</div>
                <div className={styles.isUsed}>사용</div>
                <div className={styles.seqNum}>순서</div>
                <div className={styles.editBtn}>수정</div>
              </div>

              {menus && menus?.lowerMenu?.length > 0 ? (
                menus?.lowerMenu?.map((menu: MenuType) => {
                  const isSelected = showingLowerId === menu.menuId;
                  const menuIdx = menu.idx || 0;
                  console.log("menu", menu);

                  return (
                    <ListLine
                      key={menuIdx}
                      menu={menu}
                      menuIdx={menuIdx}
                      isSelected={isSelected}
                      mode={mode}
                      setMode={setMode}
                      editingMenuIdx={editingMenuIdx}
                      selectedGroups={selectedMenus}
                      onClickEdit={onClickEdit}
                      onCheck={onCheck}
                      onChangeEditingGroup={onChangeEditingLower}
                      handleKeyDown={handleKeyDown}
                      handleSaveEdit={handleSaveEdit}
                      // handleMenuSelect={handleMenuSelect}
                    />
                  );
                })
              ) : (
                <div className={styles.emptyList}>
                  이 상위 메뉴에 속한 하위 메뉴가 없습니다.
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyList}>
              상위 메뉴를 선택하면 해당 메뉴의 하위 메뉴가 여기에 표시됩니다.
            </div>
          )}
          <Divider type="none" />
          <IconNode
            cursorPointer
            onClick={addLower}
            iconName="circlePlus"
            size={30}
            color="gray4"
            padding="2rem"
          />
        </div> */}
      </div>
    </>
  );
}
