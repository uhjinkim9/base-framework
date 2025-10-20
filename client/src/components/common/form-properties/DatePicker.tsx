"use client";
import styles from "./styles/DateTimeRangePicker.module.scss";
import {useCallback, useEffect, useRef, useState} from "react";

import {
	toKSTDateString,
	toUTCDateString,
	validateDate,
} from "@/util/helpers/timezone";

export type DateType = {
	date: string;
};

type Props = {
	initDate?: string; // 초기 세팅용 날짜
	initDateNm?: string; // e.target → 'name'에 들어갈 값
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	readOnly?: boolean;
	ariaLabel?: string; // 접근성 개선
	errorMessage?: string; // 에러 메시지
};

export default function DatePicker({
	initDate,
	initDateNm,
	onChange,
	readOnly = false,
	ariaLabel,
	errorMessage,
}: Props) {
	const [dateData, setDateData] = useState<DateType>({date: ""});
	const [error, setError] = useState<string>("");
	const {date} = dateData;
	const dateNm = initDateNm ?? "startedAt";
	const isInitialized = useRef(false);

	// 안전한 이벤트 객체 생성 함수
	const createChangeEvent = useCallback(
		(name: string, value: string): React.ChangeEvent<HTMLInputElement> => {
			return {
				target: {
					name,
					value,
					type: "date",
				} as HTMLInputElement,
				currentTarget: {
					name,
					value,
					type: "date",
				} as HTMLInputElement,
			} as React.ChangeEvent<HTMLInputElement>;
		},
		[]
	);

	// initDate 초기값 설정 (한 번만 실행)
	useEffect(() => {
		if (!initDate || isInitialized.current) return;

		try {
			const wholeDateString = toKSTDateString(initDate);
			const onlyDate = wholeDateString
				? wholeDateString.split("T")[0]
				: "";

			if (validateDate(onlyDate)) {
				setDateData({date: onlyDate});
				setError("");
				isInitialized.current = true;
			} else {
				setError("유효하지 않은 날짜입니다.");
			}
		} catch (error) {
			console.error("날짜 초기화 실패:", error);
			setError("날짜 초기화에 실패했습니다.");
		}
	}, [initDate, validateDate]);

	// 날짜 변경 핸들러
	const onChangeDate = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const {value} = e.target;

			// 유효성 검사
			if (!validateDate(value)) {
				setError("유효하지 않은 날짜입니다.");
				return;
			}

			setError("");
			setDateData({date: value});

			// onChange 콜백 호출 (UTC 변환하여)
			if (onChange && value) {
				const utcValue = toUTCDateString(`${value}T00:00:00`);
				const changeEvent = createChangeEvent(dateNm, utcValue);
				onChange(changeEvent);
			}
		},
		[validateDate, onChange, dateNm, createChangeEvent]
	);

	// 표시할 에러 메시지 결정
	const displayError = error || errorMessage;

	return (
		<div className={styles.wrapper}>
			<div className={styles.dateInputGroup}>
				<input
					type="date"
					name="date"
					value={date}
					onChange={onChangeDate}
					readOnly={readOnly}
					aria-label={ariaLabel || "날짜 선택"}
					aria-describedby={displayError ? "date-error" : undefined}
					aria-invalid={!!displayError}
				/>
				{displayError && (
					<div
						id="date-error"
						className={styles.errorMessage}
						role="alert"
						aria-live="polite"
					>
						{displayError}
					</div>
				)}
			</div>
		</div>
	);
}
