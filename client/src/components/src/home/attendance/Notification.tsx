"use client";
import styles from "./styles//Notification.module.scss";
import AlertService from "@/services/alert.service";

import {useEffect, useState} from "react";
import {requestPost} from "@/util/api/api-service";
import {UserNotification} from "@/types/notification.type";
import {dateWithHyphenAndTimeWithColon} from "@/util/helpers/formatters";
import clsx from "clsx";
import IconNode from "@/components/common/segment/IconNode";

export default function Notification() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // 알림 목록 조회
  const getNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const res = await requestPost("/notification/getUserNotifications", {
        limit: 5,
      });

      if (res.statusCode === 200) {
        setNotifications(res.data || []);
      } else {
        console.error("알림 조회 실패:", res.message);
      }
    } catch (error) {
      console.error("알림 조회 중 오류:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // 알림 읽음 처리 및 URL 열기
  const handleNotificationClick = async (
    notification: UserNotification,
    openUrl: boolean = true,
  ) => {
    try {
      // 읽음 처리
      if (!notification.isRead) {
        const res = await requestPost("/notification/markAsRead", {
          userNotificationIdx: notification.userNotificationIdx,
        });

        if (res.statusCode === 200) {
          // 로컬 상태 즉시 업데이트
          setNotifications((prev) =>
            prev.map((n) =>
              n.userNotificationIdx === notification.userNotificationIdx
                ? {...n, isRead: true, readAt: new Date().toISOString()}
                : n,
            ),
          );
        }
      }

      // 2. URL 열기
      if (openUrl && notification.data?.url) {
        window.open(notification.data.url, "_blank");
      }
    } catch (error) {
      console.error("알림 처리 중 오류:", error);
      AlertService.error("알림 처리 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  return (
    <>
      <div key="bell" className={styles.container}>
        {isLoadingNotifications ? (
          <div>알림을 불러오는 중...</div>
        ) : notifications.length === 0 ? (
          <div className={styles.noNoti}>새로운 알림이 없습니다</div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <ListLine
                key={notification.userNotificationIdx}
                notification={notification}
                handleNotificationClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

import React from "react";

const ListLine = React.memo(
  ({
    notification,
    handleNotificationClick,
  }: {
    notification: UserNotification;
    handleNotificationClick: (
      notification: UserNotification,
      openUrl?: boolean,
    ) => void;
  }) => (
    <div
      className={styles.lineContainer}
      style={{
        backgroundColor: notification.isRead ? "#f9f9f9" : "#fff",
      }}
    >
      <div className={styles.lineWrapper}>
        <div
          className={clsx(
            styles.notiContent,
            notification.isRead ? styles.isRead : styles.isNotRead,
          )}
        >
          <div onClick={() => handleNotificationClick(notification)}>
            <span className={styles.title}>[{notification.title}]</span>
            <span>{notification.body}</span>
          </div>
          <IconNode
            iconName="check"
            color="gray4"
            size={12}
            onClick={() => handleNotificationClick(notification, false)}
          />
        </div>
        <span className={styles.date}>
          {dateWithHyphenAndTimeWithColon(new Date(notification.deliveredAt))}
        </span>
      </div>
    </div>
  ),
  (prev, next) => prev.notification.isRead === next.notification.isRead, // 읽음 상태만 비교
);
