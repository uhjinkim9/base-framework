"use client";

import {useEffect, useMemo, useRef} from "react";
import {usePathname, useRouter} from "next/navigation";

import {usePlanContext} from "@/context/PlanContext";
import {redirectToDeepestMenu} from "@/util/common/menu-redirect";

export default function PlanSubPage() {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu] = pathSegs;

  const {planMenus} = usePlanContext();
  const menus = useMemo(() => {
    if (!planMenus) return [];
    return [...(planMenus.private ?? []), ...(planMenus.public ?? [])];
  }, [planMenus]);

  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!redirectedRef.current && menus.length > 0) {
      redirectToDeepestMenu(menus, mainMenu, subMenu, router, pathname);
      redirectedRef.current = true;
    }
  }, [menus, mainMenu, subMenu, router, pathname]);

  return null;
}
