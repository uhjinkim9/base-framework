"use client";
import {useEffect, useMemo, useRef} from "react";
import {usePathname, useRouter} from "next/navigation";

import {useMailContext} from "@/context/MailContext";
import {redirectToDeepestMenu} from "@/util/common/menu-redirect";

export default function MailSubPage() {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu] = pathSegs;

  const {mailMenus} = useMailContext();
  const menus = useMemo(() => {
    return [...(mailMenus?.private ?? []), ...(mailMenus?.public ?? [])];
  }, [mailMenus]);

  const redirectedRef = useRef(false);

  useEffect(() => {
    if (menus && Array.isArray(menus) && menus.length > 0) {
      redirectToDeepestMenu(menus, mainMenu, subMenu, router, pathname);
      redirectedRef.current = true;
    }
  }, [menus, mainMenu, subMenu]);
}
