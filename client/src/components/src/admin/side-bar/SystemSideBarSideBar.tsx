"use client";
import clsx from "clsx";
import styles from "@/components/common/layout/styles/SideBar.module.scss";
import Link from "next/link";
import SideBar from "../../../common/layout/SideBar";
import Divider from "@/components/common/segment/Divider";

import {usePathname} from "next/navigation";
import {useEffect} from "react";
import {LocalStorage} from "@/util/common/storage";
import {requestPost} from "@/util/api/api-service";
import {useAdminContext} from "@/context/AdminContext";
import {SideBarMenuType} from "@/types/menu.type";

export default function SystemSideBar() {
  const {adminMenus, setAdminMenus} = useAdminContext();

  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu, leafMenu] = pathSegs;
  const userId = LocalStorage.getUserId();

  async function getAdminMenus() {
    if (!userId) return;
    const res = await requestPost("/auth/getAdminMenus", {
      upperNode: subMenu,
    });
    if (res.statusCode === 200) {
      setAdminMenus(res.data);
    }
  }

  useEffect(() => {
    getAdminMenus();
  }, []);

  const renderMenuTree = (menu: any) => {
    const isActive = menu?.menuId === leafMenu;

    const menuContentInner = (
      <>
        <div
          className={clsx(
            styles.menuContent,
            menu.nodeLevel === 1 ? styles.nodeFolder : "",
          )}
        >
          <span>{menu.menuNm}</span>
        </div>
      </>
    );

    return (
      <>
        <li
          key={menu.menuIdx}
          className={clsx(styles.subMenuItem, isActive ? styles.active : "")}
        >
          <div className={styles.menuItemWrapper}>
            <Link href={`/${mainMenu}/${menu.upperNode}/${menu.menuId}`}>
              {menuContentInner}
            </Link>
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

  return (
    <SideBar>
      <div className={styles.menuSection}>
        <ul className={styles.subMenuList}>
          {adminMenus?.map((m: SideBarMenuType) => (
            <div key={m.menuIdx || m.menuId}>{renderMenuTree(m)}</div>
          ))}
        </ul>
        <Divider type="soft" />
      </div>
    </SideBar>
  );
}
