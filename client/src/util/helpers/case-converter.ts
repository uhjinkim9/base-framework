/**
 * @module case-converter.ts
 * @fileoverview 케이스 변환 함수 모음
 */

/**
 * @description 스네이크 → 파스칼
 */
export const snakeToPascal = (str?: string) => {
	if (typeof str !== "string") return "";
	return str
		.split(/[-_]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join("");
};

/**
 * @description 카멜 → 스네이크
 */
export const camelToSnake = (str?: string) => {
	if (typeof str !== "string") return "";
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};