"use client";

import styles from "./styles/SpaceInCard.module.scss";

interface SpaceInCardProps {
	children: React.ReactNode;
}

export default function SpaceInCard({children}: SpaceInCardProps) {
	return <div className={styles["space-in-card"]}>{children}</div>;
}
