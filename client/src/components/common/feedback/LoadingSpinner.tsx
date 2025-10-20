"use client";
import styles from "./styles/loading.module.scss";

export default function LoadingSpinner() {
	return (
		<div className={styles.spinnerWrapper}>
			<div className={styles.spinner}></div>
		</div>
	);
}
