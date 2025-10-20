"use client";
import styles from "./layout.module.scss";
import {usePathname} from "next/navigation";

import Breadcrumb from "@/components/common/layout/BreadCrumb";
import ContentCard from "@/components/common/layout/ContentCard";
import SystemSideBar from "@/components/src/admin/side-bar/SystemSideBarSideBar";
import AdminSubSideBar from "@/components/src/admin/side-bar/AdminSubSideBar";

import {AdminProvider} from "@/context/AdminContext";
import {snakeToPascal} from "@/util/helpers/case-converter";

export default function AdminLayout({children}: {children: React.ReactNode}) {
  const menuId = usePathname().split("/")[2];
  const pascalName = snakeToPascal(menuId);

  const sideBarMap: Record<string, React.FC> = {
    SystemSideBar,
    AdminSubSideBar,
  };

  if (!menuId) return null;
  const componentKey = `${pascalName}SideBar`;
  const Cpnent = sideBarMap[componentKey];

  return (
    <AdminProvider>
      <div className={styles.container}>
        <Breadcrumb />
        <div className={styles.screen}>
          {Cpnent ? (
            <Cpnent />
          ) : (
            <div>사이드바 컴포넌트 없음: {pascalName}</div>
          )}
          <ContentCard noPadding>
            <div className={styles.content}>{children}</div>
          </ContentCard>
        </div>
      </div>
    </AdminProvider>
  );
}
