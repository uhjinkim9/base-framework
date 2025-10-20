"use client";
import styles from "./styles/IconImage.module.scss";
import clsx from "clsx";
import Image from "next/image";

// 아이콘 맵 정의 - 새 아이콘 추가 시 여기에 추가
const iconMap: Record<string, string> = {
	menu_burger: "/icon/menu_burger.svg",
	logout: "/icon/logout.svg",
	warning_diamond: "/icon/warning_diamond.svg",
};

type IconImageProps = {
	iconName: keyof typeof iconMap;
	size?: number;
	alt?: string;
	className?: string;
	onHoverOpaque?: boolean;
	onClick?: () => void;
};

export default function IconImage({
	iconName,
	size = 20,
	alt,
	className = "",
	onHoverOpaque,
	onClick,
}: IconImageProps) {
	const iconPath = iconMap[iconName];

	if (!iconPath) {
		console.warn(`Icon "${iconName}" not found in iconMap`);
		return null;
	}

	return (
		<Image
			src={iconPath}
			alt={alt || iconName}
			width={size}
			height={size}
			className={clsx(
				className,
				onHoverOpaque ? styles.onHoverOpaque : "",
				styles.icon
			)}
			style={{flex: "display", alignItems: "center"}}
			onClick={onClick}
		/>
	);
}

// 사용 가능한 아이콘 이름들을 export (타입 안정성을 위해)
export type IconName = keyof typeof iconMap;

// 사용 예시:
// <IconImage iconName="menu_burger" size={24} alt="메뉴" className="mr-2" />
