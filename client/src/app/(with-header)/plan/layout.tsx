"use client";
import {snakeToPascal} from "@/util/helpers/case-converter";
import {usePathname} from "next/navigation";

import styles from "./layout.module.scss";
import Breadcrumb from "@/components/common/layout/BreadCrumb";
import ContentCard from "@/components/common/layout/ContentCard";
import CalendarSideBar from "@/components/src/plan/side-bar/CalendarSideBar";
import AttendanceSideBar from "@/components/src/plan/side-bar/AttendanceSideBar";

export default function ScheduleCommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuNm = usePathname().split("/")[2];

  // PascalName 기준으로 사이드바 컴포넌트 등록
  const sideBarMap: Record<string, React.FC> = {
    CalendarSideBar,
    AttendanceSideBar,
  };

  const pascalName = snakeToPascal(menuNm); // board → Board
  const componentKey = `${pascalName}SideBar`; // BoardSideBar
  const Component = sideBarMap[componentKey];

  return (
    <>
      <div className={styles.container}>
        <Breadcrumb />
        <div className={styles.screen}>
          {Component && <Component />}
          <ContentCard>
            <div className={styles.content}>{children}</div>
          </ContentCard>
        </div>
      </div>
    </>
  );
}
