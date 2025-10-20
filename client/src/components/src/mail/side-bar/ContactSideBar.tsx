"use client";
import styles from "@/components/common/layout/styles/SideBar.module.scss";
import Link from "next/link";
import clsx from "clsx";
import AlertService from "@/services/alert.service";
import SideBar from "@/components/common/layout/SideBar";
import Divider from "@/components/common/segment/Divider";
import Button from "@/components/common/form-properties/Button";
import IconNode from "@/components/common/segment/IconNode";
import InputBasic from "@/components/common/form-properties/InputBasic";

import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {requestPost} from "@/util/api/api-service";
import {useMailContext} from "@/context/MailContext";
import {SideBarMenuType} from "@/types/menu.type";
import {isNotEmpty} from "@/util/validators/check-empty";
import {validateFolderNm} from "@/util/common/validate-common";

export default function ContactSideBar() {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu, leafMenu] = pathSegs;
  const {mailMenus, setMailMenus} = useMailContext();

  const [hoveredIdx, setHoveredIdx] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  async function getMailMenus() {
    const res = await requestPost("/mail/getMailMenus", {
      upperNode: subMenu,
    });
    if (res.statusCode === 200) {
      setMailMenus(res.data);
    }
  }
  useEffect(() => {
    getMailMenus();
  }, []);

  const renderMenuTree = (menu: any) => {
    const isActive = menu?.menuId === leafMenu;
    const isEditingMenu = isEditing === menu.menuId;

    const menuContentInner = (
      <div
        className={clsx(
          styles.menuContent,
          menu.nodeLevel === 1 ? styles.nodeFolder : "",
        )}
      >
        {isEditingMenu ? (
          <div onClick={(e) => e.preventDefault()}>
            <InputBasic
              type="text"
              name="menuName"
              value={editingValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingValue(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, menu.menuId)}
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
    );

    return (
      <>
        <li
          key={menu.menuIdx}
          className={clsx(styles.subMenuItem, isActive ? styles.active : "")}
          onMouseEnter={() => setHoveredIdx(menu.menuId)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <div className={styles.menuItemWrapper}>
            <Link 
              href={`/${mainMenu}/${subMenu}/${menu.menuId}`}
              onClick={(e) => {
                if (isEditingMenu) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
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
                <div key={child.menuIdx || child.menuId || child.id}>
                  {renderMenuTree(child)}
                </div>
              ))}
            </ul>
          )}
        </li>
      </>
    );
  };

  const onClickAdd = () => {
    router.push(`/${mainMenu}/${subMenu}/add-contact`);
  };

  const addContactFolder = async () => {
    try {
      const res = await requestPost("/mail/createMailMenu", {
        menuNm: "새 폴더",
        upperNode: "contact",
      });

      if (res.statusCode === 200) {
        AlertService.success(res.message);
        setMailMenus((prev) => ({
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
      const res = await requestPost("/mail/updateMailMenu", requestData);

      if (res.statusCode === 200) {
        AlertService.success(res.message);
        setMailMenus((prev) => ({
          ...prev,
          private:
            prev?.private?.map((menu) =>
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
          `폴더명 변경에 실패했습니다: ${res.message || "알 수 없는 오류"}`,
        );
      }
    } catch (error) {
      console.error("handleSaveEdit 에러:", error);
      AlertService.error("폴더명 변경 중 오류가 발생했습니다.");
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
    setTimeout(() => {
      if (isEditing) {
        handleCancelEdit();
      }
    }, 100);
  };

  const handleCancelEdit = () => {
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
      const res = await requestPost("/mail/deleteMailMenu", {
        menuId: menuId,
      });

      if (res.statusCode === 200) {
        AlertService.success("폴더가 삭제되었습니다.");
        setMailMenus((prev) => ({
          ...prev,
          private:
            prev?.private?.filter((menu) => menu.menuId !== menuId) || [],
        }));
        setIsEditing(null);
        setEditingValue("");
      } else {
        AlertService.error("폴더 삭제에 실패했습니다.");
      }
    } catch (error) {
      AlertService.error("폴더 삭제 중 오류가 발생했습니다.");
      console.error("폴더 삭제 error:", error);
    }
  };

  return (
    <>
      <SideBar usingPencilBtn onClickPencilBtn={onClickAdd}>
        <div className={styles.menuSection}>
          {/* Public 메뉴 (기본 메뉴) */}
          <ul className={styles.subMenuList}>
            {mailMenus?.public?.map((m: SideBarMenuType) => (
              <div key={m.menuId}>{renderMenuTree(m)}</div>
            ))}
          </ul>

          <Divider type="soft" />

          {/* Private 메뉴 (사용자 메뉴) */}
          <ul className={styles.subMenuList}>
            {mailMenus?.private?.map((m: SideBarMenuType) => (
              <div key={m.menuId}>{renderMenuTree(m)}</div>
            ))}
          </ul>

          {isNotEmpty(mailMenus?.private) && <Divider type="soft" />}
          <Button componentType="text" onClick={addContactFolder} onHoverOpaque>
            폴더 추가
          </Button>
        </div>
      </SideBar>
    </>
  );
}
