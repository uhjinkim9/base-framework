"use client";
import styles from "./styles/MenuName.module.scss";

export default function MenuName({children}: {children: React.ReactNode}) {
	return <h2 className={styles.title}>{children}</h2>;
}
