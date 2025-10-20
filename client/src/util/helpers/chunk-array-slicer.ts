/**
 * @description 배열을 지정한 크기만큼 잘라서 여러 개의 하위 배열로 분리하는 함수
 *
 * @param {T[]} array - 나눌 원본 배열
 * @param {number} size - 청크 크기 (한 청크에 들어갈 요소 수)
 * @returns {T[][]} - 나눠진 배열들의 배열 (이중 배열)
 */

export function chunkArraySlicer<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}
