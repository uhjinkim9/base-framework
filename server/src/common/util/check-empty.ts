/**
 * @description 값이 비어있지 않은지 확인
 * 숫자나 boolean 등은 기본적으로 비어있지 않다고 봄
 */
export function isNotEmpty(value: any): boolean {
  if (value === null || value === undefined || value === "undefined")
    return false;

  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    // Date, RegExp, Map, Set 등은 별도 처리하거나 제외할 수 있음
    if (value instanceof Date) return true;
    return Object.keys(value).length > 0;
  }

  return true;
}

/**
 * @description 값이 비어있는지 확인
 */
export function isEmpty(value: any): boolean {
  return !isNotEmpty(value);
}
