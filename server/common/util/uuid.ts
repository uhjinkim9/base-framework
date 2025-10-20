import {v4 as uuidv4} from "uuid";
import {nanoid} from "nanoid";

/**
 * 랜덤 문자열 ID를 생성하는 함수
 */
export const generateUUID = (): string => {
  return uuidv4();
};

/**
 * nanoid를 사용하여 n자리 랜덤 문자열 ID를 생성하는 함수
 * 기본적으로 URL-safe 문자(a-z, A-Z, 0-9, -, _)를 사용
 */
export const generateNanoId = (num: number = 21): string => {
  return nanoid(num);
};
