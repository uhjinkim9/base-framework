import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ko";

dayjs.extend(timezone);
dayjs.extend(utc);

import {isEmpty} from "../validators/check-empty";

// ------------------------- 날짜/시간 관련 -------------------------
export function getTodayDateWithHyphen(): string {
  return dayjs.utc().tz("Asia/Seoul").locale("ko").format("YYYY-MM-DD");
}

/**
 * 날짜와 시간을 "YYYY. M. D. 오전/오후 h:mm" 형태로 반환
 */
export function dateTimeWithPeriod(date: Date): string {
  return dayjs
    .utc(date)
    .tz("Asia/Seoul")
    .locale("ko")
    .format("YYYY. M. D. A h:mm");
}

/**
 * 날짜를 "YYYY년 M월 D일" 형태로 반환
 */
export function fullDateWithLabel(date: string | Date): string {
  if (isEmpty(date)) return "(날짜 없음)";
  return dayjs.utc(date).tz("Asia/Seoul").locale("ko").format("YYYY년 M월 D일");
}

/**
 * 날짜와 시간을 "YYYY년 M월 D일 오전/오후 h시 mm분" 형태로 반환
 */
export function fullDateTimeWithLabel(date: string | Date): string {
  return dayjs
    .utc(date)
    .tz("Asia/Seoul")
    .locale("ko")
    .format("YYYY년 M월 D일 A h시 mm분");
}

/**
 * 날짜를 "M월 D일"로 반환
 */
export function monthDayWithLabel(date: Date): string {
  return dayjs.utc(date).tz("Asia/Seoul").locale("ko").format("M월 D일");
}

/**
 * 날짜를 "YYYY. M. D." 형태로 반환
 */
export function dateWithPeriod(date: Date): string {
  return dayjs.utc(date).tz("Asia/Seoul").format("YYYY. M. D.");
}

/**
 * 날짜에서 일(D)을 "D일" 형태로 반환
 */
export function dayWithLabel(date: string | Date): string {
  return dayjs.utc(date).tz("Asia/Seoul").locale("ko").format("D일");
}

/**
 * 날짜를 "YYYY-MM-DD" 형태로 반환
 */
export function dateWithHyphen(weekDate: Date): string {
  return dayjs.utc(weekDate).tz("Asia/Seoul").format("YYYY-MM-DD");
}

/**
 * 날짜를 "YYYY-MM-DD HH:mm" 형태로 반환
 */
export function dateWithHyphenAndTimeWithColon(date: Date): string {
  return dayjs.utc(date).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm");
}

/**
 * 시간 문자열("HH:mm:ss") 또는 날짜를 "HH:mm" 형태로 반환
 */
export const timeWithMinute = (date: Date | string): string => {
  if (!date) return "";

  // 이미 "HH:mm" 또는 "HH:mm:ss" 형식인 경우
  if (typeof date === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(date)) {
    return date.slice(0, 5); // "HH:mm:ss" → "HH:mm" 또는 "HH:mm" 그대로
  }
  // Date 객체나 ISO 문자열인 경우
  return dayjs.utc(date).tz("Asia/Seoul").format("HH:mm");
};

/**
 * 분 단위를 HH:MM 형식으로 변환
 */
export const formatMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

/**
 * "2025-10-04" + "20:03:00" → "2025-10-04T20:03:00"
 */
export const combineDateTime = (dateStr: string, timeStr: string) => {
  // "2025-10-04" + "20:03:00" → "2025-10-04T20:03:00"
  return `${dateStr}T${timeStr}`;
};

/**
 * 시간을 "HH:mm:ss" 형태로 반환
 */
export const timeWithSecond = (date: Date): string => {
  return dayjs.utc(date).tz("Asia/Seoul").format("HH:mm:ss");
};

/**
 * 시간을 "HH:00:00" 형태로 반환 (분/초 00 고정)
 */
export const timeOnlyHourWithPadding = (date: Date): string => {
  return dayjs.utc(date).tz("Asia/Seoul").format("HH:00:00");
};

// ------------------------- 문자열 관련 -------------------------

/**
 * HTML 문자열에서 태그 제거(&nbsp; 등 디코딩 포함)
 */
export function stripHtmlTags(html: string): string {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent?.trim() || "";
}
