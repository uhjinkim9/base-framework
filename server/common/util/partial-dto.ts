/**
 * @fileoverview partialDto 함수
 * @description DTO 객체에서 `undefined`나 `null` 값을 제거하여, 필드 값이 유효한 객체를 반환하는 함수
 *
 * @param {T} obj - 정리할 DTO 객체
 * @returns {Partial<T>} - `undefined`나 `null` 값을 제거한 객체
 *
 * @example
 * const sanitized = partialDto({ name: 'John', age: null, address: '123 Main St' });
 * // => { name: 'John', address: '123 Main St' }
 *
 * @author 김어진
 * @updated 2025-09-09
 */

export function partialDto<T extends object>(obj: T): Partial<T> {
  if (!obj || typeof obj !== 'object') return {};

  // DTO 전용 필드 (DB 엔티티에 없는 필드들)
  const dtoOnlyFields = ['payload'];

  return Object.entries(obj).reduce((acc, [key, value]) => {
    // DTO 전용 필드는 제외
    if (dtoOnlyFields.includes(key)) {
      return acc;
    }

    const isValid =
      value !== undefined &&
      value !== null &&
      !(typeof value === 'string' && value.trim() === '');

    if (isValid) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}
