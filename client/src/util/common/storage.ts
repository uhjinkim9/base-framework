/**
 * @fileoverview 스토리지 유틸리티 (LocalStorage, SessionStorage, CookieStorage)
 * @module storage
 * @description 브라우저 저장소(LocalStorage, SessionStorage, CookieStorage)를 다루는 유틸리티 함수 제공
 *
 * 주의: 문자열은 ""(큰따옴표)를 포함하여 저장하므로 내장 함수 사용하기
 * 종류: 로컬 스토리지, 세션 스토리지, 쿠키
 *
 * @author 김어진
 * @created 2025-03-18
 */

export const LocalStorage = {
	/**
	 * 로컬 스토리지에 데이터 저장
	 * @param key 저장할 데이터의 키
	 * @param value 저장할 데이터의 값
	 */
	setItem: (key: string, value: unknown): void => {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error("로컬 스토리지 저장 오류:", error);
		}
	},

	/**
	 * 로컬 스토리지에서 데이터 조회
	 * @param key 조회할 데이터의 키
	 * @returns 저장된 데이터 (없으면 null)
	 */
	getItem: <T>(key: string): T | null => {
		if (typeof window === "undefined") return null;
		try {
			const value = localStorage.getItem(key);
			return value ? JSON.parse(value) : null;
		} catch (error) {
			console.error("로컬 스토리지 조회 오류:", error);
			return null;
		}
	},

	/**
	 * 로컬 스토리지에서 USER ID 조회
	 */
	getUserId: (): string => {
		if (typeof window === "undefined") return "";
		const localStoredId = localStorage.getItem("userId");
		return localStoredId || "";
	},

	/**
	 * 로컬 스토리지에서 DEVICE ID 조회
	 */
	getDeviceId: (): string => {
		if (typeof window === "undefined") return "";
		const localStoredId = localStorage.getItem("deviceId");
		return localStoredId || "";
	},

	/**
	 * 로컬 스토리지에서 ACCESS TOKEN 조회
	 */
	getAccessToken: (): string => {
		if (typeof window === "undefined") return "";
		const accessToken = localStorage.getItem("accessToken");
		return accessToken || "";
	},

	/**
	 * 특정 키의 데이터 삭제
	 * @param key 삭제할 데이터의 키
	 */
	removeItem: (key: string): void => {
		localStorage.removeItem(key);
	},

	/**
	 * 로컬 스토리지의 모든 데이터 삭제
	 * deviceId, rememberId, userId(rememberId에 따라)는 유지
	 */
	clearAll: (): void => {
		// localStorage.removeItem("accessToken");
		// localStorage.removeItem("userNm");
		Object.keys(localStorage).forEach((key) => {
			if (
				key !== "rememberId" &&
				key !== "userId" &&
				key !== "deviceId"
			) {
				localStorage.removeItem(key);
			}
		});
	},
};

export const SessionStorage = {
	/**
	 * 세션 스토리지에 데이터 저장
	 * @param key 저장할 데이터의 키
	 * @param value 저장할 데이터의 값
	 */
	setItem: (key: string, value: unknown): void => {
		if (typeof window === "undefined") return;
		try {
			sessionStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error("세션 스토리지 저장 오류:", error);
		}
	},

	/**
	 * 세션 스토리지에서 데이터 조회
	 * @param key 조회할 데이터의 키
	 * @returns 저장된 데이터 (없으면 null)
	 */
	getItem: <T>(key: string): T | null => {
		if (typeof window === "undefined") return null;
		try {
			const value = sessionStorage.getItem(key);
			return value ? JSON.parse(value) : null;
		} catch (error) {
			console.error("세션 스토리지 조회 오류:", error);
			return null;
		}
	},

	/**
	 * 특정 키의 데이터 삭제
	 * @param key 삭제할 데이터의 키
	 */
	removeItem: (key: string): void => {
		if (typeof window === "undefined") return;
		sessionStorage.removeItem(key);
	},

	/**
	 * 세션 스토리지의 모든 데이터 삭제
	 */
	clearAll: (): void => {
		if (typeof window === "undefined") return;
		sessionStorage.clear();
	},
};

export const CookieStorage = {
	/**
	 * 쿠키 저장
	 * @param key 저장할 쿠키 키
	 * @param value 저장할 값
	 * @param expires 만료 시간 (Date 객체)
	 * @param path 쿠키 접근 가능 경로 (기본값: "/")
	 */
	setItem: (key: string, value: string, expires: Date, path = "/"): void => {
		document.cookie = `${key}=${encodeURIComponent(
			value
		)}; expires=${expires.toUTCString()}; path=${path}`;
	},

	/**
	 * 쿠키 조회
	 * @param key 조회할 쿠키의 키
	 * @returns 쿠키 값 (없으면 null)
	 */
	getItem: (key: string): string | null => {
		return (
			document.cookie
				.split("; ")
				.reduce<Record<string, string>>((cookies, cookie) => {
					const [cookieKey, cookieValue] = cookie.split("=");
					cookies[cookieKey] = decodeURIComponent(cookieValue);
					return cookies;
				}, {})[key] || null
		);
	},

	/**
	 * 특정 쿠키 삭제
	 * @param key 삭제할 쿠키 키
	 * @param path 삭제할 경로 (기본값: "/")
	 */
	removeItem: (key: string, path = "/"): void => {
		document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
	},

	/**
	 * 모든 쿠키 삭제
	 */
	clearAll: (): void => {
		document.cookie.split(";").forEach((cookie) => {
			const key = cookie.split("=")[0].trim();
			document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
		});
	},
};
