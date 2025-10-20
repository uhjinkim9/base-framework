"use client";
import styles from "./styles/TimePicker.module.scss";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  initTime?: string; // 초기 설정값 (HH:MM 또는 HH:MM:SS 형태)
  name?: string; // input의 name 속성
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  ariaLabel?: string; // 접근성 텍스트
  errorMessage?: string; // 외부 에러 메시지
  step?: number; // 시간 간격 (초 단위, 기본: 60초 = 1분)
  includeSeconds?: boolean; // 초 표시 여부 (기본: false)
};

export default function TimePicker({
  initTime,
  name = "time",
  onChange,
  readOnly = false,
  ariaLabel,
  errorMessage,
  step = 60,
  includeSeconds = false,
}: Props) {
  const [time, setTime] = useState<string>("09:00");
  const [error, setError] = useState<string>("");
  const isInitialized = useRef(false);

  // synthetic change event 생성
  const createChangeEvent = useCallback(
    (name: string, value: string): React.ChangeEvent<HTMLInputElement> => {
      return {
        target: { name, value } as HTMLInputElement,
        currentTarget: { name, value } as HTMLInputElement,
      } as React.ChangeEvent<HTMLInputElement>;
    },
    []
  );

  // 시간 형식 검증
  const validateTime = useCallback((timeValue: string): boolean => {
    const timeRegex = includeSeconds 
      ? /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/ // HH:MM:SS
      : /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM
    return timeRegex.test(timeValue);
  }, [includeSeconds]);

  // 시간 형식 변환 (HH:MM:SS → HH:MM 또는 반대)
  const formatTimeForDisplay = useCallback((serverTime: string): string => {
    if (!serverTime) return "09:00";
    
    // HH:MM:SS → HH:MM (초 제거)
    if (!includeSeconds && serverTime.includes(":") && serverTime.split(":").length === 3) {
      return serverTime.substring(0, 5);
    }
    
    // HH:MM → HH:MM:SS (초 추가)
    if (includeSeconds && serverTime.includes(":") && serverTime.split(":").length === 2) {
      return `${serverTime}:00`;
    }
    
    return serverTime;
  }, [includeSeconds]);

  // 서버로 전송할 형식으로 변환 (항상 HH:MM:SS)
  const formatTimeForServer = useCallback((timeValue: string): string => {
    if (!timeValue) return "09:00:00";
    
    if (timeValue.includes(":") && timeValue.split(":").length === 2) {
      return `${timeValue}:00`; // HH:MM → HH:MM:SS
    }
    
    return timeValue; // 이미 HH:MM:SS 형태
  }, []);

  // 초기값 설정
  useEffect(() => {
    if (!initTime || isInitialized.current) return;
    
    try {
      const formattedTime = formatTimeForDisplay(initTime);
      
      if (validateTime(formattedTime)) {
        setTime(formattedTime);
        setError("");
        isInitialized.current = true;
      } else {
        setError("유효하지 않은 시간 형식입니다");
      }
    } catch (err) {
      console.error("시간 초기화 실패:", err);
      setError("시간 초기화에 실패했습니다.");
    }
  }, [initTime, formatTimeForDisplay, validateTime]);

  // 시간 변경 처리
  const onChangeTime = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      
      if (value && !validateTime(value)) {
        setError("유효하지 않은 시간입니다 (HH:MM 형식으로 입력해주세요)");
        return;
      }

      setError("");
      setTime(value);

      if (onChange) {
        // 서버에는 항상 HH:MM:SS 형태로 전송
        const serverFormattedTime = formatTimeForServer(value);
        const changeEvent = createChangeEvent(name, serverFormattedTime);
        onChange(changeEvent);
      }
    },
    [onChange, name, createChangeEvent, validateTime, formatTimeForServer]
  );

  const displayError = error || errorMessage;

  return (
    <div className={styles.wrapper}>
      <div className={styles.timeInputGroup}>
        <input
          type="time"
          name={name}
          value={time}
          onChange={onChangeTime}
          readOnly={readOnly}
          step={step}
          aria-label={ariaLabel || "시간 선택"}
          aria-describedby={displayError ? "time-error" : undefined}
          aria-invalid={!!displayError}
          className={styles.timeInput}
        />
        
        {displayError && (
          <div id="time-error" className={styles.errorMessage} role="alert" aria-live="polite">
            {displayError}
          </div>
        )}
      </div>
    </div>
  );
}
