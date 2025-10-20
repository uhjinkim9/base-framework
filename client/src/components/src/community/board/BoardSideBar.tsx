"use client";
import styles from "@/components/common/layout/styles/SideBar.module.scss";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import Link from "next/link";
import clsx from "clsx";

import {LocalStorage} from "@/util/common/storage";
import {requestPost} from "@/util/api/api-service";
import {useBoardContext} from "@/context/BoardContext";
import {SideBarMenuType} from "@/types/menu.type";
import {isNotEmpty} from "@/util/validators/check-empty";
import AlertService from "@/services/alert.service";
import useModal from "@/hooks/useModal";
import InputBasic from "@/components/common/form-properties/InputBasic";
import {validateFolderNm} from "@/util/common/validate-common";

import IconNode from "@/components/common/segment/IconNode";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import Divider from "@/components/common/segment/Divider";
import SideBar from "@/components/common/layout/SideBar";
import Modal from "@/components/common/layout/Modal";
import Button from "@/components/common/form-properties/Button";
import AddBoard from "./AddBoard";

export default function BoardSideBar() {
  const {boardMenus, setBoardMenus, postDispatch, boardState, boardDispatch} =
    useBoardContext();
  const [hoveredIdx, setHoveredIdx] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const {selected} = boardState;
  const {openModal, closeModal, modalConfig} = useModal();

  const router = useRouter();
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu, leafMenu, sideMain, sideSub] = pathSegs;
  const userId = LocalStorage.getUserId();
  async function getBoardMenus() {
    if (!userId) return;
    const res = await requestPost("/board/getBoardMenus");
    if (res.statusCode === 200) {
      setBoardMenus(res.data);
    }
  }

  useEffect(() => {
    getBoardMenus();
  }, []);

  function onClickAddContentButton() {
    postDispatch({type: "RESET"});
    postDispatch({type: "SET_MODE", payload: "add"});
    const urlLeaf = "add-post";
    router.push(`/${mainMenu}/${subMenu}/${urlLeaf}`);
  }

  const onClickAddBoard = async () => {
    try {
      const res = await requestPost("/board/createBoardMenu", {
        menuNm: "새 폴더",
        upperNode: "custom",
      });
      // menuId가 같은게 없을경우 res.data 추가, 이미 존재할경우 res.data로 교체
      if (res.statusCode === 200) {
        AlertService.success(res.message);
        setBoardMenus((prev) => ({
          ...boardMenus,
          psBoards: prev.psBoards
            .map((board) =>
              board.menuId === res.data.menuId ? res.data : board,
            )
            .concat(
              prev.psBoards.some((board) => board.menuId === res.data.menuId)
                ? []
                : [res.data],
            ),
        }));
      } else {
        AlertService.error("게시판 추가에 실패했습니다.");
      }
    } catch (error) {
      AlertService.error("게시판 추가 중 오류가 발생했습니다.");
      console.error("게시판 추가 error:", error);
    }
  };

  const renderMenuTree = (menu: any) => {
    const isActive = menu?.menuId === sideMain;
    const isEditingMenu = isEditing === menu.menuId;

    const menuContentInner = (
      <>
        <div
          className={clsx(
            styles.menuContent,
            menu.nodeLevel === 1 ? styles.nodeFolder : "",
          )}
        >
          {isEditingMenu ? (
            <div
              onClick={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
            >
              <InputBasic
                type="text"
                name="menuNm"
                value={editingValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingValue(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e, menu.menuId)
                }
                onBlur={handleBlur}
                autoFocus={true}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{menu.menuNm}</span>
          )}
        </div>
      </>
    );

    return (
      <>
        <li
          key={menu.menuId}
          className={clsx(styles.subMenuItem, isActive ? styles.active : "")}
          onMouseEnter={() => setHoveredIdx(menu.menuId)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <div className={styles.menuItemWrapper}>
            <Link
              href={
                menu.nodeLevel === 1
                  ? `/${mainMenu}/${subMenu}/${menu.menuId}`
                  : `/${mainMenu}/${subMenu}/${menu.upperNode}/${menu.menuId}`
              }
            >
              {menuContentInner}
            </Link>
            {menu.isCustomed &&
              (hoveredIdx === (menu.menuId ?? "") || isEditingMenu) && (
                <div className={styles.editIconWrapper}>
                  {isEditingMenu && (
                    <IconNode
                      iconName={"trash"}
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
                        : onClickEditFolder(menu.menuId ?? "", menu.menuNm);
                    }}
                  />
                </div>
              )}
          </div>
          {menu.children && menu.children.length > 0 && (
            <ul className={styles.subMenuList}>
              {menu.children.map((child: any) => (
                <div key={child.menuId || child.menuId || child.id}>
                  {renderMenuTree(child)}
                </div>
              ))}
            </ul>
          )}
        </li>
      </>
    );
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
      const res = await requestPost("/board/updateBoardMenu", requestData);

      if (res.statusCode === 200) {
        AlertService.success(res.message);
        setBoardMenus((prev) => ({
          ...prev,
          psBoards:
            prev?.psBoards?.map((menu) =>
              menu.menuId === menuId
                ? {...menu, menuNm: editingValue.trim()}
                : menu,
            ) || [],
        }));
        setIsEditing(null);
        setEditingValue("");
      } else {
        console.error("API 실패 응답:", res);
        AlertService.error(
          `게시판명 변경에 실패했습니다: ${res.message || "알 수 없는 오류"}`,
        );
        // 실패 시에는 편집 모드를 유지
      }
    } catch (error) {
      console.error("handleSaveEdit 에러:", error);
      AlertService.error("게시판명 변경 중 오류가 발생했습니다.");
      // 에러 시에도 편집 모드를 유지
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, menuId: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(menuId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleBlur = () => {
    // 체크 버튼 클릭 시 blur(input 요소가 포커스를 잃는 이벤트)가 먼저 발생하는 것을 방지하기 위해 약간 지연
    setTimeout(() => {
      if (isEditing) {
        handleCancelEdit();
      }
    }, 100);
  };

  // 메뉴 이름 수정 모드 취소
  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditingValue("");
  };

  const handleDeleteFolder = async (menuId: string) => {
    AlertService.warn("정말로 이 게시판을 삭제하시겠습니까?", {
      useConfirmBtn: true,
      useCancelBtn: true,
      onConfirm: () => deleteConfirmed(menuId),
      onCancel: () => console.log("취소"),
    });
  };

  const deleteConfirmed = async (menuId: string) => {
    try {
      const res = await requestPost("/board/deleteBoardMenu", {
        menuId: menuId,
      });

      if (res.statusCode === 200) {
        AlertService.success("게시판이 삭제되었습니다.");
        setBoardMenus((prev) => ({
          ...prev,
          psBoards:
            prev?.psBoards?.filter((menu) => menu.menuId !== menuId) || [],
        }));
        setIsEditing(null);
        setEditingValue("");
      } else {
        AlertService.error("게시판 삭제에 실패했습니다.");
      }
    } catch (error) {
      AlertService.error("게시판 삭제 중 오류가 발생했습니다.");
      console.error("게시판 삭제 error:", error);
    }
  };

  return (
    <>
      <SideBar
        // cpMenus={boardMenus.cpBoards}
        // psMenus={boardMenus.psBoards}
        // onClickAddPsMenu={onClickAddBoard}
        // onClickEditPsMenu={onClickEditBoard}
        usingPencilBtn
        onClickPencilBtn={onClickAddContentButton}
      >
        <div className={styles.menuSection}>
          <ul className={styles.subMenuList}>
            {boardMenus.cpBoards
              ?.filter((m: SideBarMenuType) => Number(m.nodeLevel) === 1)
              .map((m: SideBarMenuType) => (
                <div key={m.menuId}>{renderMenuTree(m)}</div>
              ))}
          </ul>

          <Divider type="middle" />

          <ul className={styles.subMenuList}>
            {boardMenus.psBoards
              ?.filter((m: SideBarMenuType) => Number(m.nodeLevel) === 2)
              .map((m: SideBarMenuType) => (
                <div key={m.menuId}>{renderMenuTree(m)}</div>
              ))}
          </ul>
          {/* {isNotEmpty(boardMenus?.psBoards) && <Divider type="middle" />} */}
          {isNotEmpty(boardMenus?.psBoards)}
          <Button componentType="text" onClick={onClickAddBoard} onHoverOpaque>
            게시판 추가
          </Button>
        </div>
      </SideBar>
    </>
  );
}
