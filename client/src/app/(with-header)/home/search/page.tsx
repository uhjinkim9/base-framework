"use client";
import React, {useState, useEffect} from "react";

import styles from "./page.module.scss";

export default function Home() {
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

	return (
		<>
			<main className={styles.main}>
				<div className={styles["card-container-half"]}>검색~</div>
			</main>
		</>
	);
}
