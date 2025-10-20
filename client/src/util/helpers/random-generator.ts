import {v4 as uuidv4} from "uuid";
import {nanoid} from "nanoid";

// UUID 생성 함수
export const generateUUID = (): string => {
	return uuidv4();
};

/**
 * 8자리 정수 형태의 랜덤 숫자를 생성하는 유틸 함수
 * (10,000,000부터 99,999,999까지)
 * @returns {number} 8자리 랜덤 정수
 */
export const generateEightDigitNum = (): number => {
	const min = 10000000; // 8자리 숫자의 시작
	const max = 99999999; // 8자리 숫자의 끝

	// (max - min + 1)을 곱해서 원하는 범위의 숫자를 만들고, min을 더해서 시작점을 맞춤
	// 마지막으로 Math.floor()로 소수점 버리기
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * nanoid를 사용하여 n자리 랜덤 문자열 ID를 생성하는 함수
 * 기본적으로 URL-safe 문자(a-z, A-Z, 0-9, -, _)를 사용합니다.
 *
 * 주의: 4자리 ID는 충돌 발생 확률이 상대적으로 높으므로,
 *       매우 짧은 생명 주기나 제한된 범위 내에서의 고유성이 필요한 경우에만 사용을 권장합니다.
 *       (예: 단일 페이지 내 임시 UI ID)
 *
 * @returns {string} n자리 랜덤 문자열 ID
 */
export const generateNanoId = (num: number): string => {
	return nanoid(num); // nanoid 함수에 길이를 인자로 전달
};
