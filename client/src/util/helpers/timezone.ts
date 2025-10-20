import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * @fileoverview 타임존 및 날짜 변환 유틸리티
 * @module timezone
 * @description 이 모듈은 dayjs를 활용해 UTC와 KST 간의 변환, 날짜 유효성 검사, 시간 연산 등의 기능을 제공합니다.
 *
 * @author 김어진
 * @updated 2025-09-09
 */

/** KST → UTC ISO 문자열로 변환 (저장용) */
export function toUTCDateString(dateString: string): string {
	if (!dateString) return "";

	const parsed = dayjs(dateString);
	if (!parsed.isValid()) {
		console.warn("Invalid date for toUTCDateString:", dateString);
		return "";
	}

	return parsed.tz("Asia/Seoul").utc().toISOString();
}

/** UTC 문자열 → KST ISO 문자열 변환 (렌더링용) */
export function toKSTDateString(dateString: string): string {
	if (!dateString) return "";

	const parsed = dayjs.utc(dateString);
	if (!parsed.isValid()) {
		console.warn("Invalid date for toKSTDateString:", dateString);
		return "";
	}

	return parsed.tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm");
}

// 시간 더하는 함수
export function addHour(dateStr: string, hour: number): string {
	const baseDate = dayjs.utc(dateStr);
	if (!baseDate.isValid()) {
		console.warn("Invalid date for addHour:", dateStr);
		return "";
	}
	const added = baseDate.add(hour, "hour").toISOString();
	return added;
}

// 그냥 utc 기준 '일' 얻기
export function getDateNumber(dateStr: string): number {
	const baseDate = dayjs.utc(dateStr);
	if (!baseDate.isValid()) {
		console.warn("Invalid date for getDateNumber:", dateStr);
		return -1;
	}
	return baseDate.date();
}

// 날짜 유효성 검사 함수
export const validateDate = (dateString: string): boolean => {
	if (!dateString) return true; // 빈 값은 허용
	const dateObj = dayjs(dateString);
	return dateObj.isValid();
};
