"use client";

import clsx from "clsx";
import styles from "./styles/HeaderText.module.scss";

export default function HeaderText() {
	return (
		<>
			<div className={clsx(styles.title, "headerText")}>
				<h1 className={styles.colorOrange}>U</h1>
				<h1 className={styles.colorNavy}>CUBERS</h1>
			</div>
		</>
	);
}
