/**
 * @fileoverview List 컴포넌트
 * @description 다양한 데이터 항목을 리스트 형식으로 렌더링하고, 각 항목을 클릭할 수 있는 기능을 제공하는 범용 리스트 컴포넌트
 *
 * @interface ListProps<T, ClickPayload>
 * @property {T[]} listItems - 리스트로 렌더링할 데이터 항목 배열
 * @property {string[]} [headerItems] - 리스트 상단에 표시할 헤더 항목 배열 (선택 사항)
 * @property {(payload: ClickPayload) => void} [onClickTitle] - 항목 클릭 시 호출될 이벤트 핸들러 (선택 사항)
 * @property {(item: T, onClickTitle?: (payload: ClickPayload) => void) => React.ReactNode} renderRow - 각 리스트 항목을 렌더링할 함수
 *
 * @function List - 주어진 데이터 항목을 리스트 형식으로 렌더링하며, 항목 클릭 시 클릭 이벤트를 처리할 수 있도록 지원
 *
 * @effect
 * - `headerItems`가 제공되면 해당 항목들을 리스트 상단에 표시
 * - `listItems`에 있는 각 항목을 `renderRow` 함수로 렌더링하며, 항목 클릭 시 `onClickTitle` 함수가 호출됨
 *
 * @author 김어진
 * @created 2025-04-14
 * @version 1.0.0
 */

"use client";
import styles from "./styles/List.module.scss";

type ListProps<T = any, ClickPayload = any> = {
	listItems: T[];
	headerItems?: string[];
	onClickTitle?: (payload: ClickPayload) => void;
	renderRow: (
		item: T,
		onClickTitle?: (payload: ClickPayload) => void
	) => React.ReactNode;
};

export default function List<T, ClickPayload>({
	listItems,
	headerItems,
	onClickTitle,
	renderRow,
}: ListProps<T, ClickPayload>) {
	return (
		<div className={styles.boardContainer}>
			<div className={styles.boardHeader}>
				{headerItems?.map((item, idx) => (
					<span key={idx}>{item}</span>
				))}
			</div>
			<ul className={styles.boardList}>
				{listItems.map((item, idx) => (
					<li key={idx} className={styles.boardItem}>
						{renderRow(item, onClickTitle)}
					</li>
				))}
			</ul>
		</div>
	);
}
