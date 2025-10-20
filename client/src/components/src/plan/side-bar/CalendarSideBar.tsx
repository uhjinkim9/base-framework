"use client";
import styles from "../styles/CalendarSideBar.module.scss";
import clsx from "clsx";
import AlertService from "@/services/alert.service";
import useModal from "@/hooks/useModal";
import ColoredCircle from "@/components/common/segment/ColoredCircle";
import CheckBox from "@/components/common/form-properties/CheckBox";
import SideBar from "@/components/common/layout/SideBar";
import Divider from "@/components/common/segment/Divider";
import Button from "@/components/common/form-properties/Button";
import PlanAddModal from "../modal/PlanAddModal";

import {ChangeEvent, KeyboardEvent, useEffect, useState, useRef} from "react";
import {usePathname} from "next/navigation";
import {isNotEmpty} from "@/util/validators/check-empty";
import {requestPost} from "@/util/api/api-service";
import {LocalStorage} from "@/util/common/storage";
import {usePlanContext} from "@/context/PlanContext";
import IconNode from "@/components/common/segment/IconNode";
import {validateFolderNm} from "@/util/common/validate-common";
import {SideBarMenuType} from "@/types/menu.type";

export default function CalendarSideBar() {
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu, leafMenu] = pathSegs;
  const {
    planDispatch,
    checkedCalList,
    setIsCheckedCalList,
    planMenus,
    setPlanMenus,
  } = usePlanContext();

  const [hoveredIdx, setHoveredIdx] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [tempColors, setTempColors] = useState<Map<string, string>>(new Map());
  const [isMouseDown, setIsMouseDown] = useState<string | null>(null);
  const colorInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const textInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const addNewPlanModal = useModal();

  useEffect(() => {
    LocalStorage.setItem("checkedCalList", checkedCalList);
  }, [checkedCalList]);

  function onCheckCal(e: ChangeEvent<HTMLInputElement>) {
    const {checked, name} = e.target;
    const menuId = name;

    setIsCheckedCalList((prev) => {
      const newList = checked
        ? [...prev, {name: menuId, checked: checked}]
        : prev.filter((cal) => cal.name !== menuId);
      return newList;
    });
  }

  const getPlanMenus = async () => {
    const res = await requestPost("/plan/getPlanMenus", {
      upperNode: subMenu,
    });
    if (res.statusCode === 200) {
      setPlanMenus(res.data);
    }
  };
  useEffect(() => {
    getPlanMenus();
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = async () => {
      if (isMouseDown) {
        const newColor = tempColors.get(isMouseDown);
        if (newColor) {
          await updateMenuColor(newColor, isMouseDown);
        }
        setIsMouseDown(null);
      }
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isMouseDown, tempColors]);

  useEffect(() => {
    if (!planMenus) return;

    const legacyToMenuId = new Map<string, string>();

    const traverse = (nodes?: SideBarMenuType[]) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((node) => {
        if (!node) return;
        const legacyKey =
          node?.menuIdx !== undefined ? String(node.menuIdx) : undefined;
        if (node.menuId && legacyKey && legacyKey !== node.menuId) {
          legacyToMenuId.set(legacyKey, node.menuId);
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(planMenus.public);
    traverse(planMenus.private);

    if (legacyToMenuId.size === 0) return;

    setIsCheckedCalList((prev) => {
      let changed = false;
      const dedup = new Map<string, {name: string; checked: boolean}>();

      prev.forEach((item) => {
        const mappedKey = legacyToMenuId.get(item.name);
        const nextKey = mappedKey ?? item.name;
        if (mappedKey && mappedKey !== item.name) {
          changed = true;
        }
        const existing = dedup.get(nextKey);
        const nextChecked = existing
          ? existing.checked || item.checked
          : item.checked;
        dedup.set(nextKey, {name: nextKey, checked: nextChecked});
      });

      return changed ? Array.from(dedup.values()) : prev;
    });
  }, [planMenus, setIsCheckedCalList]);

  const renderMenuTree = (menu: any) => {
    const isEditingMenu = isEditing === menu.menuId;
    const isCustomMenu = Boolean(menu?.isCustomed);

    const menuContentInner = (
      <>
        <div
          className={clsx(
            styles.menuContent,
            menu.nodeLevel === 1 ? styles.nodeFolder : "",
          )}
        >
          <CheckBox
            name={menu.menuId}
            checkValue={menu.menuId}
            value={checkedCalList?.some(
              (checkedItem) => checkedItem.name === menu.menuId,
            )}
            onChange={onCheckCal}
            componentType="mark"
          />
          {isEditingMenu ? (
            <input
              ref={(ref) => {
                if (ref) {
                  textInputRefs.current.set(menu.menuId, ref);
                } else {
                  textInputRefs.current.delete(menu.menuId);
                }
              }}
              type="text"
              className={styles.menuInput}
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, menu.menuId)}
              onBlur={handleBlur}
              autoFocus
            />
          ) : (
            <span>{menu.menuNm}</span>
          )}
          <div style={{position: "relative", cursor: "pointer"}}>
            <input
              ref={(ref) => {
                if (ref) {
                  colorInputRefs.current.set(menu.menuId, ref);
                } else {
                  colorInputRefs.current.delete(menu.menuId);
                }
              }}
              type="color"
              value={
                tempColors.get(menu.menuId) ||
                menu.menuColor ||
                menu.color ||
                "#000"
              }
              onChange={(e) => handleColorInputChange(e, menu.menuId)}
              onMouseDown={() => setIsMouseDown(menu.menuId)}
              onMouseUp={(e) => handleColorMouseUp(e, menu.menuId)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                opacity: 0,
                width: 0,
                height: 0,
                pointerEvents: "none",
              }}
            />
            <div
              onMouseDown={(e) => {
                if (isEditingMenu) {
                  e.preventDefault(); // 기본 동작 방지하여 포커스 손실 막기
                  handleColorClick(menu.menuId);
                }
              }}
              style={{cursor: isEditingMenu ? "pointer" : "default"}}
            >
              <ColoredCircle
                colorCode={
                  tempColors.get(menu.menuId) ||
                  menu.menuColor ||
                  menu.color ||
                  "#000"
                }
              />
            </div>
          </div>
        </div>
      </>
    );

    const showEditIcons =
      isCustomMenu && (hoveredIdx === menu.menuId || isEditingMenu);

    return (
      <>
        <li
          key={menu.menuId}
          className={clsx(styles.subMenuItem)}
          onMouseEnter={() => setHoveredIdx(menu.menuId)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <div className={styles.menuItemWrapper}>
            <div>{menuContentInner}</div>
            {showEditIcons && (
              <div className={styles.editIconWrapper}>
                {isEditingMenu && (
                  <IconNode
                    iconName="trash"
                    color="red"
                    size={13}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteFolder(menu.menuId);
                    }}
                  />
                )}
                <IconNode
                  iconName={isEditingMenu ? "check" : "pencil"}
                  color={isEditingMenu ? "green" : "gray4"}
                  size={13}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isEditingMenu
                      ? handleSaveEdit(menu.menuId)
                      : onClickEditFolder(menu.menuId, menu.menuNm);
                  }}
                />
              </div>
            )}
          </div>
          {menu.children && menu.children.length > 0 && (
            <ul className={styles.subMenuList}>
              {menu.children.map((child: any) => {
                const childKey = String(child?.menuId ?? child?.menuIdx ?? "");
                return <div key={childKey}>{renderMenuTree(child)}</div>;
              })}
            </ul>
          )}
        </li>
      </>
    );
  };

  function onClickAddPlan() {
    planDispatch({type: "RESET"});
    planDispatch({type: "SET_MODE", payload: "add"});
    addNewPlanModal.openModal();
  }

  const addPlanFolder = async () => {
    try {
      const res = await requestPost("/plan/createPlanMenu", {
        menuNm: "새 폴더",
        upperNode: "calendar",
      });

      if (res.statusCode === 200) {
        AlertService.success(res.message);
        setPlanMenus((prev) => ({
          ...prev,
          private: [...(prev?.private || []), res.data],
        }));
      } else {
        AlertService.error("폴더 추가에 실패했습니다.");
      }
    } catch (error) {
      AlertService.error("폴더 추가 중 오류가 발생했습니다.");
      console.error("폴더 추가 error:", error);
    }
  };

  const onClickEditFolder = (menuId: string, currentName: string) => {
    setIsEditing(menuId);
    setEditingValue(currentName);
  };

  const handleSaveEdit = async (menuId: string) => {
    const validationCheck = validateFolderNm(editingValue);
    if (!validationCheck) return;

    try {
      const requestData = {
        menuId: menuId,
        menuNm: editingValue.trim(),
      };
      const res = await requestPost("/plan/updatePlanMenu", requestData);

      if (res.statusCode === 200) {
        AlertService.success(res.message);
        setPlanMenus((prev) => ({
          ...prev,
          private:
            prev?.private?.map((menu) =>
              menu.menuId === menuId
                ? {...menu, menuNm: editingValue.trim()}
                : menu,
            ) || [],
        }));
        resetEditState();
      } else {
        console.error("API 실패 응답:", res);
        AlertService.error(
          `폴더명 변경에 실패했습니다: ${res.message || "알 수 없는 오류"}`,
        );
      }
    } catch (error) {
      console.error("handleSaveEdit 에러:", error);
      AlertService.error("폴더명 변경 중 오류가 발생했습니다.");
      // 에러 시에도 편집 모드를 유지
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    menuId: string,
  ) => {
    if (e.key === "Enter") {
      handleSaveEdit(menuId);
    } else if (e.key === "Escape") {
      resetEditState();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // 색상 피커가 열리는 중이면 편집 상태 유지
    if (isColorPickerOpen) {
      return;
    }

    // 색상 피커로 포커스가 이동한 경우도 편집 상태 유지
    const relatedTarget = e.relatedTarget as HTMLInputElement;
    if (relatedTarget && relatedTarget.type === "color") {
      return;
    }

    setTimeout(() => {
      if (isEditing && !isColorPickerOpen) {
        resetEditState();
      }
    }, 100);
  };

  const resetEditState = () => {
    setIsEditing(null);
    setEditingValue("");
  };

  const handleDeleteFolder = async (menuId: string) => {
    AlertService.warn("정말로 이 폴더를 삭제하시겠습니까?", {
      useConfirmBtn: true,
      useCancelBtn: true,
      onConfirm: () => deleteConfirmed(menuId),
      onCancel: () => console.log("취소"),
    });
  };

  const deleteConfirmed = async (menuId: string) => {
    try {
      const res = await requestPost("/plan/deletePlanMenu", {
        menuId: menuId,
      });

      if (res.statusCode === 200) {
        AlertService.success("폴더가 삭제되었습니다.");
        setPlanMenus((prev) => ({
          ...prev,
          private:
            prev?.private?.filter((menu) => menu.menuId !== menuId) || [],
        }));
        resetEditState();
      } else {
        AlertService.error("폴더 삭제에 실패했습니다.");
      }
    } catch (error) {
      AlertService.error("폴더 삭제 중 오류가 발생했습니다.");
      console.error("폴더 삭제 error:", error);
    }
  };

  const findMenuInAllMenus = (menuId: string) => {
    return [...(planMenus?.public || []), ...(planMenus?.private || [])]
      .find(m => m.menuId === menuId);
  };

  const handleColorClick = (menuId: string) => {
    setIsColorPickerOpen(true);
    const currentColor = findMenuInAllMenus(menuId)?.menuColor || "#000";
    setTempColors(prev => new Map(prev).set(menuId, currentColor));
    
    const colorInput = colorInputRefs.current.get(menuId);
    colorInput?.click();
  };

  const handleColorInputChange = (e: ChangeEvent<HTMLInputElement>, menuId: string) => {
    setTempColors(prev => new Map(prev).set(menuId, e.target.value));
  };

  const handleColorMouseUp = async (
    e: React.MouseEvent<HTMLInputElement>,
    menuId: string,
  ) => {
    if (isMouseDown === menuId) {
      const newColor = tempColors.get(menuId);
      if (newColor) {
        await updateMenuColor(newColor, menuId);
      }
    }
    setIsMouseDown(null);
  };

  const updateMenuColor = async (newColor: string, menuId: string) => {
    try {
      const res = await requestPost("/plan/updatePlanMenu", {
        menuId: menuId,
        menuColor: newColor,
      });

      if (res.statusCode === 200) {
        AlertService.success("색상이 변경되었습니다.");
        // UI 상태 업데이트
        setPlanMenus((prev) => {
          const updateMenuColor = (menus: any[]): any[] => {
            return menus?.map((menu) => {
              if (menu.menuId === menuId) {
                return {...menu, menuColor: newColor, color: newColor};
              }
              if (menu.children && menu.children.length > 0) {
                return {...menu, children: updateMenuColor(menu.children)};
              }
              return menu;
            });
          };

          return {
            ...prev,
            public: updateMenuColor(prev?.public || []),
            private: updateMenuColor(prev?.private || []),
          };
        });
      } else {
        AlertService.error("색상 변경에 실패했습니다.");
      }
    } catch (error) {
      AlertService.error("색상 변경 중 오류가 발생했습니다.");
      console.error("색상 변경 error:", error);
    }

    // 상태 정리 및 포커스 복원
    cleanupColorState(menuId);
  };

  const cleanupColorState = (menuId: string) => {
    setIsColorPickerOpen(false);
    setTempColors(prev => {
      const newMap = new Map(prev);
      newMap.delete(menuId);
      return newMap;
    });

    // 텍스트 input에 포커스 복원
    setTimeout(() => {
      const textInput = textInputRefs.current.get(menuId);
      if (textInput) {
        textInput.focus();
        textInput.setSelectionRange(textInput.value.length, textInput.value.length);
      }
    }, 50);
  };

  return (
    <>
      <SideBar usingPencilBtn onClickPencilBtn={onClickAddPlan}>
        <div className={styles.menuSection}>
          {/* Public 메뉴 (기본 메뉴) */}
          <ul className={styles.subMenuList}>
            {planMenus?.public?.map((m: SideBarMenuType) => (
              <div key={m.menuId}>{renderMenuTree(m)}</div>
            ))}
          </ul>

          <Divider type="soft" />

          {/* Private 메뉴 (사용자 메뉴) */}
          <ul className={styles.subMenuList}>
            {planMenus?.private?.map((m: SideBarMenuType) => (
              <div key={m.menuId}>{renderMenuTree(m)}</div>
            ))}
          </ul>

          {isNotEmpty(planMenus?.private) && <Divider type="soft" />}
          <Button componentType="text" onClick={addPlanFolder} onHoverOpaque>
            폴더 추가
          </Button>
        </div>
      </SideBar>

      <PlanAddModal addNewPlanModal={addNewPlanModal} />
    </>
  );
}
