/**
 * 불리언 값 변환기
 * - to: boolean 값을 1 또는 0으로 변환
 * - from: 숫자를 boolean으로 변환
 */
export const boolTransformer = {
  /**
   * boolean 값을 1(true) 또는 0(false)로 변환합니다.
   * @param v 불리언 값
   * @returns true면 1, false면 0
   */
  to: (v?: boolean) => (v ? 1 : 0),
  /**
   * 숫자를 boolean으로 변환합니다.
   * @param v 숫자 값
   * @returns 0 또는 undefined면 false, 그 외는 true
   */
  from: (v?: number) => !!v,
};

/**
 * 숫자 값 변환기
 * - to: 값을 숫자로 변환
 * - from: 숫자 값을 그대로 반환
 */
export const numberTransformer = {
  /**
   * 값을 숫자로 변환합니다.
   * @param value 아무 값
   * @returns 숫자 값
   */
  to: (value?: any) => (typeof value !== 'number' ? Number(value) : value),
  /**
   * 숫자 값을 그대로 반환합니다.
   * @param value 숫자 값
   * @returns 입력받은 숫자 값
   */
  from: (value?: number) => value,
};

/**
 * 날짜 값 변환기
 * - to: 문자열 또는 Date를 Date 객체로 변환
 * - from: Date를 ISO 문자열 또는 null로 변환
 */
export const dateTransformer = {
  /**
   * 문자열 또는 Date를 Date 객체로 변환합니다.
   * @param value Date 또는 문자열
   * @returns Date 객체 또는 값이 없으면 원래 값
   */
  to: (value?: Date | string) => {
    if (!value) return value;
    return value instanceof Date ? value : new Date(value);
  },
  /**
   * Date 객체를 ISO 문자열로 변환하거나, 유효하지 않으면 null을 반환합니다.
   * @param value Date 객체
   * @returns ISO 문자열 또는 null
   */
  from: (value?: Date) => {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString();
    }
    return null;
  },
};

// 시용 방법 2가지

/** DTO에서 @Transform 데코레이터와 함께 사용:
 *
 * // Boolean 변환 (true/false → 1/0)
 * @Transform(({ value }) => boolTransformer.to(value))
 * @IsNumber()
 * isUsed?: number;
 *
 * // Number 변환 (string → number)
 * @Transform(({ value }) => numberTransformer.to(value))
 * @IsInt()
 * nodeLevel: number;
 *
 * // Date 변환 (string → Date)
 * @Transform(({ value }) => dateTransformer.to(value))
 * @IsDate()
 * createdAt?: Date;
 */

/** 엔티티 정의 파일에서 다음과 같이 사용:
 *
 * @Column({
 *   name: 'is_final_approved',
 *   type: 'tinyint',
 *   width: 1,
 *   default: 0,
 *   nullable: false,
 *   comment: '완료 여부',
 *   transformer: boolTransformer,
 * })
 * isFinalApproved: boolean;
 *
 * @Column({
 *   name: 'scheduled_at',
 *   type: 'datetime',
 *   nullable: true,
 *   comment: '예약일',
 *   transformer: dateTransformer,
 * })
 * scheduledAt: Date;
 */
