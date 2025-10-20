"use client";
import styles from "./styles/DateTimeRangePicker.module.scss";
import {useCallback, useEffect, useRef, useState} from "react";

import {toKSTDateString, toUTCDateString, validateDate} from "@/util/helpers/timezone";

type Props = {
  initDate?: string; // 초기 설정값(UTC ISO)
  initDateNm?: string; // e.target.name
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  ariaLabel?: string; // 접근성 텍스트
  errorMessage?: string; // 외부 에러 메시지
};

export default function DateTimePicker({
  initDate,
  initDateNm,
  onChange,
  readOnly = false,
  ariaLabel,
  errorMessage,
}: Props) {
  const [dateTime, setDateTime] = useState<{ date: string; time: string }>({ date: "", time: "00:00" });
  const [error, setError] = useState<string>("");
  const dateNm = initDateNm ?? "startedAt";
  const isInitialized = useRef(false);

  // synthetic change event 생성
  const createChangeEvent = useCallback((name: string, value: string): React.ChangeEvent<HTMLInputElement> => {
    return {
      target: { name, value } as HTMLInputElement,
      currentTarget: { name, value } as HTMLInputElement,
    } as React.ChangeEvent<HTMLInputElement>;
  }, []);

  // 초기값을 KST 기준으로 분리해 세팅
  useEffect(() => {
    if (!initDate || isInitialized.current) return;
    try {
      const local = toKSTDateString(initDate);
      const [d, t = "00:00"] = local ? local.split("T") : ["", "00:00"];
      if (d && validateDate(d)) {
        setDateTime({ date: d, time: t.slice(0, 5) });
        setError("");
        isInitialized.current = true;
      } else {
        setError("유효하지 않은 날짜입니다");
      }
    } catch (err) {
      console.error("날짜/시간 초기화 실패:", err);
      setError("날짜/시간 초기화에 실패했습니다.");
    }
  }, [initDate]);

  // 날짜/시간 변경 처리
  const onChangeDateTime = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const next = { ...dateTime, [name]: value } as { date: string; time: string };

      if (name === "date" && value && !validateDate(value)) {
        setError("유효하지 않은 날짜입니다");
        return;
      }

      setError("");
      setDateTime(next);

      if (onChange && next.date && next.time) {
        const utcValue = toUTCDateString(`${next.date}T${next.time}`);
        const changeEvent = createChangeEvent(dateNm, utcValue);
        onChange(changeEvent);
      }
    },
    [dateTime, onChange, dateNm, createChangeEvent]
  );

  const displayError = error || errorMessage;

  return (
    <div className={styles.wrapper}>
      <div className={styles.dateInputGroup}>
        <input
          type="date"
          name="date"
          value={dateTime.date}
          onChange={onChangeDateTime}
          readOnly={readOnly}
          aria-label={ariaLabel || "날짜 선택"}
          aria-describedby={displayError ? "date-error" : undefined}
          aria-invalid={!!displayError}
        />
        <input
          type="time"
          name="time"
          value={dateTime.time}
          onChange={onChangeDateTime}
          readOnly={readOnly}
          aria-label={ariaLabel ? `${ariaLabel} 시간` : "시간 선택"}
        />
        {displayError && (
          <div id="date-error" className={styles.errorMessage} role="alert" aria-live="polite">
            {displayError}
          </div>
        )}
      </div>
    </div>
  );
}

