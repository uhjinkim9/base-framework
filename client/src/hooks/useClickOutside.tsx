import {useCallback, useRef, useEffect} from "react";

// 특정 엘리먼트의 바깥 클릭 시 원하는 함수 실행하는 훅

/** 예시
 * const Use() => {
 *   const ref = useOutsideClick({ onClickOutside : () => {
 *     console.log("outside 가 클릭되었음!");
 *   });
 *
 *   return (
 *     <div>
 *       <h2 ref={ref}>
 *         inside
 *       </h2>
 *     </div>
 *   );
 *  }
 */

export default function useClickOutside({
	onClickOutside,
}: {
	onClickOutside: () => void;
}) {
	const ref = useRef<HTMLElement | null>(null);

	const handleClickOutside = useCallback(
		(e: MouseEvent) => {
			const inside = ref.current?.contains(e.target as Node);
			if (inside) return;

			onClickOutside();
		},
		[onClickOutside, ref]
	);

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [handleClickOutside]);

	return ref;
}
