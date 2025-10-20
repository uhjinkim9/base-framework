"use client";

const STORAGE_KEY = "lastUrl";

/** 현재 경로를 세션에 저장 */
export function saveLastUrl(path: string) {
	try {
		if (typeof window !== "undefined" && window.sessionStorage) {
			window.sessionStorage.setItem(STORAGE_KEY, path);
		}
	} catch {
		// ssr 환경 또는 브라우저 제한 예외 무시
	}
}

/** 저장된 경로 가져오기 (없으면 빈 문자열) */
export function getLastUrl(): string {
	try {
		if (typeof window !== "undefined" && window.sessionStorage) {
			return window.sessionStorage.getItem(STORAGE_KEY) || "";
		}
		return "";
	} catch {
		return "";
	}
}
