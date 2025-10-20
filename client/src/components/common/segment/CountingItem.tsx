"use client";
import style from "@/components/common/segment/styles/CountingItem.module.scss";
import clsx from "clsx";
import {useRouter} from "next/navigation";
/**
 * CountingItem 컴포넌트
 *
 * 이 컴포넌트는 제목, 부제목, 카운트 숫자를 표시하는 UI 요소입니다.
 * 다크 모드 스타일을 지원하며, 제목과 부제목을 함께 표시할 수 있습니다.
 *
 * Props:
 * - darkMode (boolean): 다크 모드 스타일을 적용할지 여부 (기본값: false).
 * - title (string): 항목의 제목.
 * - subTitle (string): 항목의 부제목 (선택 사항).
 * - count (number): 항목의 카운트 숫자.
 *
 * 사용 예시:
 *
 * <CountingItem
 *   darkMode={true}
 *   title="진행 중"
 *   subTitle="(최근 3일)"
 *   count={23}
 * />
 */
interface Props {
	darkMode?: boolean;
	title?: string;
	subTitle?: string;
	count?: number;
	link?: string;
}

export default function CountingItem({
	darkMode,
	title,
	subTitle,
	count,
	link,
}: Props) {
	const router = useRouter();
	const handleClick = () => {
		if (link) {
			// 링크가 있을 경우, 해당 링크로 이동
			router.push(link);
		}
	};

	return (
		<div
			className={clsx(style.item, link ? style.pointer : null)}
			onClick={handleClick}
		>
			<div className={darkMode ? style.itemTitleDark : style.itemTitle}>
				{title}
				{subTitle && (
					<div className={style.itemsSubtitle}>{subTitle}</div>
				)}
			</div>
			<div className={style.itemCount}>{count}</div>
		</div>
	);
}
