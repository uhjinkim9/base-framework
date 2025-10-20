"use client";
import styles from "./layout.module.scss";
import {usePathname} from "next/navigation";
import {MailProvider} from "@/context/MailContext";
import {snakeToPascal} from "@/util/helpers/case-converter";

import Breadcrumb from "@/components/common/layout/BreadCrumb";
import ContentCard from "@/components/common/layout/ContentCard";
import MailListSideBar from "@/components/src/mail/side-bar/MailListSideBar";
import ContactSideBar from "@/components/src/mail/side-bar/ContactSideBar";

export default function MailLayout({children}: {children: React.ReactNode}) {
  const menuNm = usePathname().split("/")[2];

  // PascalName 기준으로 사이드바 컴포넌트 등록
  const sideBarMap: Record<string, React.FC> = {
    MailListSideBar,
    ContactSideBar,
  };

  const pascalName = snakeToPascal(menuNm); // board → Board
  const componentKey = `${pascalName}SideBar`; // BoardSideBar
  const Component = sideBarMap[componentKey];

  return (
    <MailProvider>
      <div className={styles.container}>
        <Breadcrumb />
        <div className={styles.screen}>
          {Component && <Component />}
          <ContentCard fullHeight noPadding>
            <div className={styles.content}>{children}</div>
          </ContentCard>
        </div>
      </div>
    </MailProvider>
  );
}
