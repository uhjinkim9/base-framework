import styles from "./styles/HeaderText.module.scss";

export default function HeaderText() {
	return (
		<div className={`${styles.title} headerText`}>
			<h1 className={styles.colorNavy}>
				{process.env.NEXT_PUBLIC_APP_NAME ?? "Base App"}
			</h1>
		</div>
	);
}
