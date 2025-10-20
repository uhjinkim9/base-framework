"use client";

import clsx from "clsx";
import styles from "./styles/SubTitle.module.scss";

type Props = {
	icon?: React.ReactNode;
	underlined?: boolean;
	children: React.ReactNode;
};

const SubTitle = ({icon, underlined = true, children}: Props) => {
	return (
		<div
			className={clsx(
				styles.titleWrapper,
				underlined && styles.underlined
			)}
		>
			{icon && <div className={styles.titleIcon}>{icon}</div>}
			<span className={styles.titleText}>{children}</span>
		</div>
	);
};

export default SubTitle;
