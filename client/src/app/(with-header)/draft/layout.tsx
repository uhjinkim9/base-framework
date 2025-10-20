"use client";
import styles from "./layout.module.scss";
import Breadcrumb from "@/components/common/layout/BreadCrumb";
import { DraftProvider } from "@/context/DraftContext";
import DraftSideBar from "./DraftSidebar";
import ContentCard from "@/components/common/layout/ContentCard";

export default function DraftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DraftProvider>
      <div className={styles.container}>
        <Breadcrumb />
        <div className={styles.screen}>
          <DraftSideBar />
          {/* <ContentCard> */}
          <div className={styles.content}>{children}</div>
          {/* </ContentCard> */}
        </div>
      </div>
    </DraftProvider>
  );
}
