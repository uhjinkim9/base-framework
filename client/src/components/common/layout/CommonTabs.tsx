"use client";
import React, { useState } from "react";

import styles from "./styles/Tabs.module.scss";

interface TabsProps {
  tabs: React.ReactNode[];
  tabContents?: React.ReactNode[];
}

const CommonTabs = ({ tabs, tabContents }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.tabsContainer}>
      {/* 탭 목록 */}
      <div className={styles.tabs}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tab} ${styles.orange} ${
              activeTab === index ? styles.active : ""
            }`}
            onClick={() => setActiveTab(index)}>
            {tab}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className={styles.tabContent}>
        {tabContents ? tabContents[activeTab] : null}
      </div>
    </div>
  );
};

export default CommonTabs;
