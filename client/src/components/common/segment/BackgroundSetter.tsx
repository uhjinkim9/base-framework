"use client";

import {usePathname} from "next/navigation";
import {useEffect} from "react";

export default function BackgroundSetter() {
	const pathname = usePathname();

	useEffect(() => {
		if (pathname === "/login") {
			document.body.className = "bg-white";
		} else {
			document.body.className = "bg-gray";
		}
	}, [pathname]);

	return null; // 실제 화면에는 아무것도 렌더링하지 않음
}
