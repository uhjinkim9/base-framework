"use client";
import {usePathname, useRouter} from "next/navigation";

import {useAdminContext} from "@/context/AdminContext";
import {
  redirectToDeepestMenu,
} from "@/util/common/menu-redirect";
import {useEffect} from "react";

export default function AdminMainPage() {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu] = pathSegs; // mainMenu: admin

  const {adminMenus} = useAdminContext();

  useEffect(() => {
    if (adminMenus && Array.isArray(adminMenus) && adminMenus.length > 0) {
      redirectToDeepestMenu(adminMenus, mainMenu, subMenu, router, pathname);
    }
  }, [adminMenus, subMenu, router, pathname]);
}
