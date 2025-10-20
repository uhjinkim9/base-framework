"use client";
import React, {useState} from "react";

import styles from "./styles/Tabs.module.scss";

interface TabsProps {
  tabs: React.ReactNode[];
  contents: React.ReactNode[];
  hasUnread?: boolean[]; // 각 탭별로 읽지 않은 상태 (벨 아이콘용)
}

const Tabs = ({tabs, contents, hasUnread = []}: TabsProps) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.tabsContainer}>
      {/* 탭 목록 */}
      <div className={styles.tabs}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tab} ${
              activeTab === index ? styles.active : ""
            }`}
            onClick={() => setActiveTab(index)}
          >
            <div style={{position: "relative", display: "inline-block"}}>
              {tab}
              {/* 🔴 읽지 않은 알림이 있으면 빨간 점 표시 */}
              {hasUnread[index] && <span className={styles.unreadDot} />}
            </div>
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className={styles.tabContent}>
        {tabs.map((_, idx) => activeTab === idx && contents[idx])}
      </div>
    </div>
  );
};

export default Tabs;
