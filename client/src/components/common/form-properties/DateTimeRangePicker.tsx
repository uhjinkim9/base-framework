"use client";
import styles from "./styles/DateTimeRangePicker.module.scss";
import {useEffect, useRef, useState} from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

import {DateTimeRangeType} from "@/types/plan.type";
import {toKSTDateString, toUTCDateString} from "@/util/helpers/timezone";

/** 너무나도 헷갈리는 타임존...
 *
 * | 구분      | 설명
 * | -------- | ---------------------------------------------------------
 * | 저장 시   | **KST → UTC 변환** 필요 (`dayjs.tz(...).utc().toISOString()`)
 * | 렌더링 시 | **UTC → KST 변환** 필요 (`dayjs.utc(...).tz("Asia/Seoul")`)
 * | 이유     | 브라우저 입력값은 로컬 타임존 기준인데, DB는 UTC 기준이므로 시간 왜곡 발생 방지 차원       |
 */

type Props = {
	startedAt?: string;
	endedAt?: string; // // 초기 세팅용으로 받아오는 값
	startName?: string;
	endName?: string; // 하드코딩 name 말고 다른 name
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	isDateOnly?: boolean;
	isStartDayOnly?: boolean;
	readOnly?: boolean;
};

export default function DateTimeRangePicker({
	startedAt,
	endedAt,
	startName,
	endName,
	onChange,
	isDateOnly = false,
	isStartDayOnly = false,
	readOnly = false,
}: Props) {
	const [dateTime, setDateTime] = useState<DateTimeRangeType>({
		startDate: "",
		startTime: "00:00",
		endDate: "",
		endTime: "23:59",
	});
	const startedAtName = startName ?? "startedAt";
	const endedAtName = endName ?? "endedAt";

	// props 값을 이 컴포넌트 상태로 세팅
	useEffect(() => {
		const localStart = startedAt ? toKSTDateString(startedAt) : "";
		const localEnd = endedAt ? toKSTDateString(endedAt) : "";

		const startParts = localStart ? localStart.split("T") : ["", ""];
		const endParts = localEnd ? localEnd.split("T") : ["", ""];

		const [startDate, startTime = "00:00"] = startParts;
		const [endDate, endTime = "23:59"] = endParts;

		const newDateTime = {
			startDate: startDate || "",
			startTime: startTime || "00:00",
			endDate: endDate || "",
			endTime: endTime || "23:59",
		};
		setDateTime(newDateTime);
	}, [startedAt, endedAt]);

	function onChangeDateTime(e: React.ChangeEvent<HTMLInputElement>) {
		const {name, value} = e.target;
		const newDateTime = {...dateTime, [name]: value};
		setDateTime(newDateTime);

		// 빈 값 체크 추가
		if (newDateTime.startDate && newDateTime.startTime) {
			const startedAtValue = toUTCDateString(
				`${newDateTime.startDate}T${newDateTime.startTime}`
			);

			if (name.startsWith("start")) {
				onChange?.({
					target: {
						name: startedAtName,
						value: startedAtValue,
					},
				} as React.ChangeEvent<HTMLInputElement>);
			}
		}

		if (newDateTime.endDate && newDateTime.endTime) {
			const endedAtValue = toUTCDateString(
				`${newDateTime.endDate}T${newDateTime.endTime}`
			);

			if (name.startsWith("end")) {
				onChange?.({
					target: {
						name: endedAtName,
						value: endedAtValue,
					},
				} as React.ChangeEvent<HTMLInputElement>);
			}
		}
	}

	const initRef = useRef(false);

	useEffect(() => {
		if (initRef.current) return;
		if (!startedAt && !endedAt) return;
		initRef.current = true;

		// 초기값이 있고 유효한 경우에만 onChange 호출
		if (dateTime.startDate && dateTime.startTime) {
			const startedAtValue = toUTCDateString(
				`${dateTime.startDate}T${dateTime.startTime}`
			);

			onChange?.({
				target: {
					name: startedAtName,
					value: startedAtValue,
				},
			} as unknown as React.ChangeEvent<HTMLInputElement>);
		}

		if (dateTime.endDate && dateTime.endTime && endedAt) {
			const endedAtValue = toUTCDateString(
				`${dateTime.endDate}T${dateTime.endTime}`
			);

			onChange?.({
				target: {
					name: endedAtName,
					value: endedAtValue,
				},
			} as unknown as React.ChangeEvent<HTMLInputElement>);
		}
	}, [dateTime]);

	return (
		<div className={styles.wrapper}>
			<div className={styles.dateInputGroup}>
				<input
					type="date"
					name="startDate"
					value={dateTime.startDate}
					onChange={onChangeDateTime}
					readOnly={readOnly}
				/>

				{!isDateOnly && (
					<input
						type="time"
						name="startTime"
						value={dateTime.startTime}
						onChange={onChangeDateTime}
						readOnly={readOnly}
					/>
				)}
			</div>

			{!isStartDayOnly && <span className={styles.tilde}>~</span>}

			{!isStartDayOnly && (
				<div className={styles.dateInputGroup}>
					<input
						type="date"
						name="endDate"
						value={dateTime.endDate}
						onChange={onChangeDateTime}
						min={dateTime.startDate}
						readOnly={readOnly}
					/>
					{!isDateOnly && (
						<input
							type="time"
							name="endTime"
							value={dateTime.endTime}
							onChange={onChangeDateTime}
							readOnly={readOnly}
						/>
					)}
				</div>
			)}
		</div>
	);
}
