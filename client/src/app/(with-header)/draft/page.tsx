"use client";
import {usePathname, useRouter} from "next/navigation";

import {useDraftContext} from "@/context/DraftContext";
import {useDraftMenuRedirect} from "@/util/common/menu-redirect";

export default function DraftPage() {
	const router = useRouter();
	const pathname = usePathname();
	const pathSegs = pathname.split("/");
	const [_, mainMenu, subMenu] = pathSegs; // mainMenu: draft

	const {draftMenus} = useDraftContext();

	// Draft 전용 리다이렉트 훅 사용 - 기본적으로 draft-dashboard로 이동
	useDraftMenuRedirect(draftMenus, "draft-dashboard", router);
}
