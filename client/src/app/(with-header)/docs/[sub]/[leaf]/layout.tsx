"use client";
import styles from "./layout.module.scss";

export default function DraftLayout({children}: {children: React.ReactNode}) {
	return (
		<div className={styles.container}>
			<div className={styles.content}>{children}</div>
		</div>
	);
}
