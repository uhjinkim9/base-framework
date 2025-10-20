/**
 * @fileoverview FadeWrapper 컴포넌트
 * @description 경로 변경 시 fade-in 효과를 적용하여 페이지 전환 시 부드러운 애니메이션을 제공하는 래퍼 컴포넌트
 *
 * @component
 * - pathname 변경 시 `fadeIn` 애니메이션 클래스를 추가하여 화면 전환 시 부드러운 fade-in 효과를 적용
 * - 컴포넌트가 언마운트될 때 fade-in 효과 클래스를 제거하여 다음 전환을 준비
 *
 * @dependencies
 * - usePathname: 현재 경로를 가져오는 Next.js 훅
 * - styles: SCSS 모듈을 통한 스타일링
 *
 * @author 김어진
 * @created 2025-03-30
 * @version 1.0.0
 */

"use client";
import {usePathname} from "next/navigation";
import {useEffect, useRef} from "react";
import styles from "./styles/FadeWrapper.module.scss";

export default function FadeWrapper({children}: {children: React.ReactNode}) {
	const pathname = usePathname();
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (wrapperRef.current) {
			wrapperRef.current.classList.add(styles.fadeIn);
		}

		return () => {
			// reset for next transition
			if (wrapperRef.current) {
				wrapperRef.current.classList.remove(styles.fadeIn);
			}
		};
	}, [pathname]);

	return (
		<div ref={wrapperRef} className={styles.fadeWrapper}>
			{children}
		</div>
	);
}
