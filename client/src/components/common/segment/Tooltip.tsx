/**
 * @fileoverview Tooltip 컴포넌트
 * @description 요소에 마우스를 올렸을 때 설명 텍스트를 보여주는 툴팁 컴포넌트
 *
 * @property {ReactNode} children - 툴팁이 적용될 대상 요소
 * @property {ReactNode} text - 툴팁에 표시할 내용 (텍스트 또는 JSX 요소)
 * @property {('top' | 'bottom')} position - 툴팁 표시 위치 (기본값: 'top')
 *
 * @component
 * - children 위에 마우스 오버 시 `text` 내용을 가진 툴팁이 표시됨
 * - position으로 툴팁이 위 또는 아래에 표시되도록 설정 가능
 * - SCSS 모듈을 사용하여 스타일 적용
 *
 * @author 김어진
 */

"use client";
import styles from "./styles/Tooltip.module.scss";
import {ReactNode} from "react";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  text: ReactNode;
  position?: "top" | "bottom";
};

export default function Tooltip({children, text, position = "top"}: Props) {
  return (
    <div className={styles.tooltipWrapper}>
      {children}
      <span
        className={clsx(styles.tooltipText, {
          [styles.top]: position === "top",
          [styles.bottom]: position === "bottom",
        })}
      >
        {text}
      </span>
    </div>
  );
}
