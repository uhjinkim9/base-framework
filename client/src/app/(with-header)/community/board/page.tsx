"use client";
import {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";

import {useBoardContext} from "@/context/BoardContext";
import {redirectToDeepestMenu} from "@/util/common/menu-redirect";

export default function BoardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu] = pathSegs; // mainMenu: community, subMenu: board

  const {boardMenus} = useBoardContext();

  const boards = [
    ...(boardMenus.cpBoards || []),
    ...(boardMenus.psBoards || []),
  ];

  useEffect(() => {
    if (boards && Array.isArray(boards) && boards.length > 0) {
      redirectToDeepestMenu(boards, mainMenu, subMenu, router, pathname);
    }
  }, [boards, subMenu, router, pathname]);
}
