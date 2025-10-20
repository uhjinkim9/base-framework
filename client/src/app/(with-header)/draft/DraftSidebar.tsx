"use client";
import { usePathname, useRouter } from "next/navigation";
import { LocalStorage } from "@/util/common/storage";
import { requestPost } from "@/util/api/api-service";
import { useDraftContext } from "@/context/DraftContext";
import wrapperStyles from "./DraftSidebar.module.scss";
import styles from "@/components/common/layout/styles/SideBar.module.scss";
import SideBar from "@/components/common/layout/SideBar";
import Button from "@/components/common/form-properties/Button";
import { PiPencilSimpleLight } from "react-icons/pi";
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";

export default function DraftSideBar() {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu, leafMenu] = pathSegs; // mainMenu: community, subMenu: board
  const { draftMenus, setDraftMenus } = useDraftContext();
  const userId = LocalStorage.getUserId();

  async function getDraftMenus() {
    // if (!userId) return;
    const res = await requestPost("/draft/getDraftMenus", { nodeLevel: 1 });
    if (res.statusCode === 200) {
      setDraftMenus(res.data);
    }
  }

  const renderMenuTree = (menu: any) => {
    const isActive = menu?.menuId === leafMenu;

    const menuContentInner = (
      <>
        <div
          className={clsx(
            styles.menuContent,
            menu.nodeLevel === 1 ? styles.nodeFolder : ""
          )}>
          <span>{menu.menuNm}</span>
        </div>
      </>
    );

    return (
      <li
        key={menu.menuIdx}
        className={clsx(styles.subMenuItem, isActive ? styles.active : "")}>
        {menu.isVisible &&
          (menu.children && menu.children.length > 0 ? (
            <div>{menuContentInner}</div>
          ) : (
            <Link href={`/${mainMenu}/${menu.upperNode}/${menu.menuId}`}>
              {menuContentInner}
            </Link>
          ))}
        {menu.children && menu.children.length > 0 && (
          <ul className={styles.subMenuList}>
            {menu.children.map((child: any) => renderMenuTree(child))}
          </ul>
        )}
      </li>
    );
  };

  const onClickWriteDraft = () => {
    router.push(`/${mainMenu}/draft-form-list`);
  };

  useEffect(() => {
    getDraftMenus();
  }, []);

  return (
    <div className={wrapperStyles.sidebar}>
      <Button componentType="bigPrimaryFirst" onClick={onClickWriteDraft}>
        <PiPencilSimpleLight />
        <span> 새 문서</span>
      </Button>
      {/* <SideBar
        //   selected={boardState.selected}
        usingHoverEffect={true}
        usingPsMenus={false}
        getMenus={getDraftMenus}
        cpMenus={draftMenus}
        commonBtnEditingOpts={{ btnSubmit: true, btnDelete: true }}
        commonBtnAddingOpts={{ btnSubmit: true }}
      /> */}

      <aside className={styles.menuColumn}>
        <div className={styles.menuSection}>
          <ul className={styles.subMenuList}>
            {draftMenus?.map((menu: any) => renderMenuTree(menu))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
