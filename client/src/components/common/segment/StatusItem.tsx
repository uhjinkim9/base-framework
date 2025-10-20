"use client";
import style from "@/components/common/segment/styles/StatusItem.module.scss";
import clsx from "clsx";
import {useRouter} from "next/navigation";

import {PiWarningDiamondFill} from "react-icons/pi";

/**
 * StatusItem 컴포넌트
 *
 * 이 컴포넌트는 상태 항목을 표시하며, 다크 모드, 긴급 상태 아이콘,
 * 상태 텍스트, 이름, 날짜, 주제 등의 정보를 포함할 수 있습니다.
 *
 * Props:
 * - darkMode (boolean): 다크 모드 스타일을 적용할지 여부 (기본값: false).
 * - isUrgent (boolean): 긴급 상태를 나타내는 아이콘을 표시할지 여부 (기본값: false).
 * - statusText (string): 상태를 나타내는 텍스트 (예: "대기", "승인").
 * - name (string): 상태와 관련된 사람 또는 엔티티의 이름.
 * - date (string): 상태와 관련된 날짜.
 * - subject (string): 상태 항목의 주제 또는 설명.
 *
 * 사용 예시:
 *
 * <StatusItem
 *   darkMode={true}
 *   isUrgent={true}
 *   statusText="대기"
 *   name="김영희"
 *   date="2025-07-23"
 *   subject="프로젝트 X 승인 요청"
 * />
 */

interface Props {
	darkMode?: boolean;
	isUrgent?: boolean;
	statusText?: string;
	name?: string;
	date?: string;
	subject?: string;
	link?: string;
}

export default function StatusItem({
	darkMode,
	isUrgent,
	statusText,
	name,
	date,
	subject,
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
			<div className={darkMode ? style.statusDark : style.status}>
				{statusText}
			</div>
			<div className={style.infoWrap}>
				<div className={style.info}>
					<div className={style.name}>{name}</div>
					<div className={style.date}>{date}</div>
				</div>
				<div className={style.subject}>
					{isUrgent && (
						<PiWarningDiamondFill className={style.urgentIcon} />
					)}
					{subject}
				</div>
			</div>
		</div>
	);
}
