"use client";
import {usePathname, useRouter} from "next/navigation";

import {usePollContext} from "@/context/PollContext";
import {useMenuRedirect} from "@/util/common/menu-redirect";

export default function Poll() {
	const router = useRouter();
	const pathname = usePathname();
	const pathSegs = pathname.split("/");
	const [_, mainMenu, subMenu] = pathSegs; // mainMenu: community

	const {pollMenus} = usePollContext();

	useMenuRedirect(pollMenus, mainMenu, subMenu, router);
}
