"use client";
import styles from "./styles/StatusPrefix.module.scss";
import {StatusBoxItem, StatusColor} from "./etc/list-content-card.type";
import clsx from "clsx";

interface StatusPrefixProps {
	statusBox: StatusBoxItem[];
	className?: string;
}

export default function StatusPrefix({
	statusBox,
	className = "",
}: StatusPrefixProps) {
	// 색상별 스타일 클래스 매핑
	const getStatusColorClass = (color: StatusColor): string => {
		const colorMap: Record<StatusColor, string> = {
			red: styles.statusRed,
			blue: styles.statusBlue,
			gray: styles.statusGray,
			green: styles.statusGreen,
			orange: styles.statusOrange,
			yellow: styles.statusYellow,
			transparent: styles.statusTransparent,
		};
		return colorMap[color] || styles.statusGray;
	};

	// statusBox 렌더링
	const renderStatusBoxes = () => {
		if (statusBox && statusBox.length > 0) {
			return statusBox.map((item, idx) => (
				<div key={idx} className={getStatusColorClass(item.color)}>
					{item.text}
				</div>
			));
		}
		return null;
	};

	return (
		<div className={clsx(className, styles.container)}>
			{renderStatusBoxes()}
		</div>
	);
}
