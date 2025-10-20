import styles from "./styles/ColoredCircle.module.scss";

export default function ColoredCircle({colorCode}: {colorCode: string}) {
	return (
		<div
			className={styles.coloredCircle}
			style={{
				backgroundColor: colorCode,
			}}
		></div>
	);
}
