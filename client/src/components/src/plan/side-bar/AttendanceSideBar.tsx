"use client";
import styles from "@/components/common/layout/styles/SideBar.module.scss";
import Link from "next/link";
import clsx from "clsx";
import SideBar from "@/components/common/layout/SideBar";

import {useEffect} from "react";
import {usePathname} from "next/navigation";
import {requestPost} from "@/util/api/api-service";
import {usePlanContext} from "@/context/PlanContext";
import {SideBarMenuType} from "@/types/menu.type";

export default function AttendanceSideBar() {
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu, leafMenu] = pathSegs;
  const {planMenus, setPlanMenus} = usePlanContext();

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

  const renderMenuTree = (menu: any) => {
    const isActive = menu?.menuId === leafMenu;

    const menuContentInner = (
      <div
        className={clsx(
          styles.menuContent,
          menu.nodeLevel === 1 ? styles.nodeFolder : "",
        )}
      >
        <span>{menu.menuNm}</span>
      </div>
    );

    return (
      <>
        <li
          key={menu.menuId}
          className={clsx(styles.subMenuItem, isActive ? styles.active : "")}
        >
          <div className={styles.menuItemWrapper}>
            <Link href={`/${mainMenu}/${subMenu}/${menu.menuId}`}>
              <div>{menuContentInner}</div>
            </Link>
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

  return (
    <>
      <SideBar>
        <div className={styles.menuSection}>
          {/* Public 메뉴 (기본 메뉴) */}
          <ul className={styles.subMenuList}>
            {planMenus?.public?.map((m: SideBarMenuType) => (
              <div key={m.menuId}>{renderMenuTree(m)}</div>
            ))}
          </ul>
        </div>
      </SideBar>
    </>
  );
}
