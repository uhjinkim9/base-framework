import {HalfOffTypes, OffTypes} from "@/types/plan.type";
import {WorkStatusEnum} from "@/types/attendance.type";
import dayjs from "dayjs";
import {combineDateTime, timeWithMinute} from "@/util/helpers/formatters";

const dayNamesEng = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const dayNamesKor = ["일", "월", "화", "수", "목", "금", "토"];

// 숫자 요일을 글자 요일로 변환
export const convertDayNumberToChar = (
  dayNumber: number,
  lang: string,
): string => {
  switch (lang) {
    case "kor":
      return dayNamesKor[dayNumber];
    case "eng":
      return dayNamesEng[dayNumber];
    default:
      return "";
  }
};

// 글자 요일을 숫자 요일로 변환
export const convertDayCharToNumber = (
  dayString: string,
  lang: string,
): number => {
  switch (lang) {
    case "kor":
      return dayNamesKor.indexOf(dayString);
    case "eng":
      return dayNamesEng.indexOf(dayString.toUpperCase());
    default:
      return -1;
  }
};

const dayoffKind = {
  GENERAL: "휴가",
  OCCASION: "경조사",
  OFFICIAL: "공가",
  SICK: "병가",
};

export function matchDayoffTypeNm(offType: string): string {
  switch (offType) {
    case OffTypes.GENERAL:
      return dayoffKind.GENERAL;
    case OffTypes.OCCASION:
      return dayoffKind.OCCASION;
    case OffTypes.OFFICIAL:
      return dayoffKind.OFFICIAL;
    case OffTypes.SICK:
      return dayoffKind.SICK;
    default:
      return "";
  }
}

const halfoffKind = {
  MORNING_OFF: "오전 반차",
  AFTERNOON_OFF: "오후 반차",
};

export function matchHalfoffNm(halfOff: string): string {
  switch (halfOff) {
    case HalfOffTypes.MORNING_OFF:
      return halfoffKind.MORNING_OFF;
    case HalfOffTypes.AFTERNOON_OFF:
      return halfoffKind.AFTERNOON_OFF;
    default:
      return "";
  }
}

export function getLastDayOfMonth(dateStr: string) {
  return dayjs(dateStr).endOf("month").toISOString();
}

/**
 * 근태 로그 데이터를 FullCalendar 이벤트 형식으로 변환
 */
export function transformAttendanceToEvents(attendanceLogs: any[]) {
  return (
    attendanceLogs?.map((log) => {
      const {
        logIdx,
        userId,
        workDate,
        checkInTime,
        checkOutTime,
        status,
        employee,
      } = log;

      // 근무 상태에 따른 색상 결정
      const getStatusColor = (status: string) => {
        switch (status) {
          case WorkStatusEnum.CHECK_IN:
            return "#4CAF50"; // 초록색 (출근)
          case WorkStatusEnum.CHECK_OUT:
            return "#2196F3"; // 파란색 (퇴근)
          case WorkStatusEnum.ABSENT:
            return "#F44336"; // 빨간색 (결근)
          case WorkStatusEnum.LEAVE:
            return "#FF9800"; // 주황색 (휴가)
          case WorkStatusEnum.HOLIDAY:
            return "#9C27B0"; // 보라색 (공휴일)
          default:
            return "#757575"; // 회색 (기본)
        }
      };

      return {
        id: String(logIdx),
        title: getStatusTitle(status, workDate, checkInTime, checkOutTime),
        start: combineDateTime(workDate, checkInTime),
        end: combineDateTime(workDate, checkOutTime),
        color: getStatusColor(status),
        textColor: "#FFFFFF",
        extendedProps: {
          ...log,
          type: "attendance",
          employeeName: employee?.korNm || userId,
          workTime:
            checkInTime && checkOutTime
              ? dayjs(checkOutTime).diff(dayjs(checkInTime), "minute")
              : 0,
        },
      };
    }) || []
  );
}

// 근무 상태에 따른 타이틀 생성
export const getStatusTitle = (
  status: string | WorkStatusEnum,
  workDate: string,
  checkInTime: string,
  checkOutTime: string,
) => {
  const combinedCheckIn = combineDateTime(workDate, checkInTime);
  const combinedCheckOut = combineDateTime(workDate, checkOutTime);

  const diffMin = dayjs(combinedCheckOut).diff(
    dayjs(combinedCheckIn),
    "minute",
  ); // 분 단위 차이
  const hours = Math.floor(diffMin / 60);
  const minutes = diffMin % 60;
  const dayTotal = `${hours}h ${minutes}m`;

  const checkIn = timeWithMinute(checkInTime || "");
  const checkOut = timeWithMinute(checkOutTime || "");

  switch (status) {
    case WorkStatusEnum.CHECK_IN:
      return `${checkIn} 출근`;
    case WorkStatusEnum.CHECK_OUT:
      return `${checkIn}-${checkOut} / ${dayTotal} 근무`;
    case WorkStatusEnum.ABSENT:
      return `결근`;
    case WorkStatusEnum.LEAVE:
      return `휴가`;
    case WorkStatusEnum.HOLIDAY:
      return `공휴일`;
    default:
      return `${status}`;
  }
};
