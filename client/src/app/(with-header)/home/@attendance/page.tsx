"use client";
import styles from "./page.module.scss";
import AlertService from "@/services/alert.service";
import Tabs from "@/components/common/layout/Tabs";
import ProfileImage from "@/components/common/segment/ProfileImage";
import Button from "@/components/common/form-properties/Button";
import Notification from "@/components/src/home/attendance/Notification";

import {useEffect, useState} from "react";
import {CiBellOn, CiCircleList} from "react-icons/ci";
import {requestPost} from "@/util/api/api-service";
import {AttendanceLogType, WorkStatusEnum} from "@/types/attendance.type";
import {UnreadCountResponse} from "@/types/notification.type";
import {timeWithMinute} from "@/util/helpers/formatters";
import {LocalStorage} from "@/util/common/storage";
import {onUnreadCountChange} from "@/util/common/socket";

const workStatusConfig: Record<
  WorkStatusEnum,
  {label: string; className: string}
> = {
  [WorkStatusEnum.CHECK_IN]: {label: "업무 중", className: "statusCheckIn"},
  [WorkStatusEnum.CHECK_OUT]: {label: "퇴근", className: "statusCheckOut"},
  [WorkStatusEnum.NOT_CHECKED]: {
    label: "출근 전",
    className: "statusNotChecked",
  },
  [WorkStatusEnum.ABSENT]: {label: "결근", className: "statusNotChecked"},
  [WorkStatusEnum.LEAVE]: {label: "휴가 중", className: "statusNotChecked"},
  [WorkStatusEnum.HOLIDAY]: {label: "휴일", className: "statusNotChecked"},
};

export default function Attendance() {
  const [attendance, setAttendance] = useState<AttendanceLogType | null>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // 읽지 않은 알림 개수 확인
  const checkUnreadNotifications = async () => {
    try {
      const res: UnreadCountResponse = await requestPost(
        "/notification/getUnreadCount",
        {count: 5},
      );

      if (res.statusCode === 200) {
        setHasUnreadNotifications(res.data.count > 0);
      }
    } catch (error) {
      console.error("읽지 않은 알림 개수 조회 중 오류:", error);
    }
  };

  const resolvedStatus =
    attendance?.status && workStatusConfig[attendance.status]
      ? attendance.status
      : WorkStatusEnum.NOT_CHECKED;

  const {label: workStatusLabel, className: workStatusClassName} =
    workStatusConfig[resolvedStatus];
  const variantClassName = styles[workStatusClassName] ?? "";

  const getAttendanceStatus = async () => {
    const res = await requestPost("/attendance/getTodayStatus");
    if (res.statusCode === 200) {
      AlertService.success(res.message);
      setAttendance(res.data);
    }
  };

  useEffect(() => {
    getAttendanceStatus();
    checkUnreadNotifications(); // 최초 1회만 호출

    // WebSocket으로 실시간 읽지 않은 알림 개수 업데이트
    const unsubscribe = onUnreadCountChange((count) => {
      setHasUnreadNotifications(count > 0);
    });

    return () => {
      unsubscribe(); // 컴포넌트 언마운트 시 리스너 정리
    };
  }, []);

  const checkInAndOut = async (type: string) => {
    const url = `/attendance/${
      type === "in" ? "insertCheckInLog" : "updateCheckOutLog"
    }`;
    const res = await requestPost(url);
    if (res.statusCode === 200) {
      AlertService.success(res.message);
      setAttendance(res.data);
    } else {
      AlertService.error(
        `${type === "in" ? "출근" : "퇴근"} 처리 중 오류가 발생했습니다.`,
      );
      console.error("Error:", res.message);
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.inCard}>
          <div className={styles.wrapper}>
            <div className={styles.attendanceWrapper}>
              <ProfileImage path="/ko-kil-dong.png" alt="profile" />
              <div className={styles.btnGroup}>
                <Button
                  componentType="primarySecond"
                  onClick={() => checkInAndOut("in")}
                >
                  {attendance?.status === WorkStatusEnum.CHECK_IN ||
                  attendance?.status === WorkStatusEnum.CHECK_OUT
                    ? timeWithMinute(attendance?.checkInTime || "")
                    : "출근"}
                </Button>
                <Button
                  componentType="secondary"
                  onClick={() => checkInAndOut("out")}
                >
                  {attendance?.status === WorkStatusEnum.CHECK_OUT
                    ? timeWithMinute(attendance?.checkOutTime || "")
                    : "퇴근"}
                </Button>
              </div>
            </div>
            <div className={styles.btnGroup}>
              <div
                className={`${styles.workStatusDisplay} ${variantClassName}`.trim()}
                role="status"
                aria-live="polite"
              >
                <span className={styles.workStatusValue}>
                  {workStatusLabel}
                </span>
              </div>
            </div>
          </div>
          <div className={styles.wrapper}>
            <Tabs
              tabs={[<CiCircleList key="list" />, <CiBellOn key="bell" />]}
              contents={[
                <div key="list">작업 목록</div>,
                <Notification key="notification" />,
              ]}
              hasUnread={[false, hasUnreadNotifications]} // 첫 번째 탭은 작업목록(읽지않음 없음), 두 번째 탭은 알림(읽지않음 상태)
            />
            {/* <div className={styles.iconWrapper}>
            <IoIosAddCircle className={styles.icon} />
          </div> */}
          </div>
          {/* <PushTestButton /> */}
        </div>
      </div>
    </>
  );
}
