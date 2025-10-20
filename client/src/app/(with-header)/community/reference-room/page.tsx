"use client";
import {usePathname, useRouter} from "next/navigation";

import {useBoardContext} from "@/context/BoardContext";
import {useMenuRedirect} from "@/util/common/menu-redirect";

export default function Board() {
	const router = useRouter();
	const pathname = usePathname();
	const pathSegs = pathname.split("/");
	const [_, mainMenu, subMenu] = pathSegs; // mainMenu: community, subMenu: board

	const {boardMenus} = useBoardContext();

	// 안전하게 배열 생성
	const boards = [
		...(boardMenus.cpBoards || []),
		...(boardMenus.psBoards || []),
	];

	useMenuRedirect(boards, mainMenu, subMenu, router);
}
