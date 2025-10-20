"use client";
import styles from "./styles/DateTimeRangePicker.module.scss";
import {useEffect, useRef, useState} from "react";

import {toKSTDateString, toUTCDateString} from "@/util/helpers/timezone";

type Props = {
	startedAt?: string;
	endedAt?: string; // 초기 세팅으로 받아오는 값
	startName?: string;
	endName?: string; // 하드코딩 name 말고 다른 name
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	readOnly?: boolean;
};

type DateRangeOnly = {
	startDate: string;
	endDate: string;
};

export default function DateRangePicker({
	startedAt,
	endedAt,
	startName,
	endName,
	onChange,
	readOnly = false,
}: Props) {
	const [dateRange, setDateRange] = useState<DateRangeOnly>({
		startDate: "",
		endDate: "",
	});

	const startedAtName = startName ?? "startedAt";
	const endedAtName = endName ?? "endedAt";

	// props 값을 로컬 상태로 세팅 (UTC -> KST -> YYYY-MM-DD)
	useEffect(() => {
		const localStart = startedAt ? toKSTDateString(startedAt) : "";
		const localEnd = endedAt ? toKSTDateString(endedAt) : "";

		const startDate = localStart ? localStart.split("T")[0] : "";
		const endDate = localEnd ? localEnd.split("T")[0] : "";

		setDateRange({startDate, endDate});
	}, [startedAt, endedAt]);

	function onChangeDate(e: React.ChangeEvent<HTMLInputElement>) {
		const {name, value} = e.target; // name: startDate | endDate
		const newRange = {...dateRange, [name]: value} as DateRangeOnly;
		setDateRange(newRange);

		// 날짜만 사용: 시작은 00:00:00, 종료는 23:59:59로 변환해 상위로 전달
		if (
			newRange.startDate &&
			(name === "startDate" || name.startsWith("start"))
		) {
			const startedAtValue = toUTCDateString(
				`${newRange.startDate}T00:00:00`
			);
			onChange?.({
				target: {name: startedAtName, value: startedAtValue},
			} as React.ChangeEvent<HTMLInputElement>);
		}

		if (
			newRange.endDate &&
			(name === "endDate" || name.startsWith("end"))
		) {
			const endedAtValue = toUTCDateString(
				`${newRange.endDate}T23:59:59`
			);
			onChange?.({
				target: {name: endedAtName, value: endedAtValue},
			} as React.ChangeEvent<HTMLInputElement>);
		}
	}

	// 최초 마운트 시 초기값이 있으면 상위에 한번 전달
	const initRef = useRef(false);
	useEffect(() => {
		if (initRef.current) return;
		if (!startedAt && !endedAt) return;
		initRef.current = true;

		if (dateRange.startDate) {
			const startedAtValue = toUTCDateString(
				`${dateRange.startDate}T00:00:00`
			);
			onChange?.({
				target: {name: startedAtName, value: startedAtValue},
			} as unknown as React.ChangeEvent<HTMLInputElement>);
		}

		if (dateRange.endDate && endedAt) {
			const endedAtValue = toUTCDateString(
				`${dateRange.endDate}T23:59:59`
			);
			onChange?.({
				target: {name: endedAtName, value: endedAtValue},
			} as unknown as React.ChangeEvent<HTMLInputElement>);
		}
	}, [dateRange, startedAt, endedAt, onChange, startedAtName, endedAtName]);

	return (
		<div className={styles.wrapper}>
			<div className={styles.dateInputGroup}>
				<input
					type="date"
					name="startDate"
					value={dateRange.startDate}
					onChange={onChangeDate}
					readOnly={readOnly}
				/>
			</div>

			<span className={styles.tilde}>~</span>

			<div className={styles.dateInputGroup}>
				<input
					type="date"
					name="endDate"
					value={dateRange.endDate}
					onChange={onChangeDate}
					min={dateRange.startDate}
					readOnly={readOnly}
				/>
			</div>
		</div>
	);
}
