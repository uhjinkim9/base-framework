"use client";
import {usePathname, useRouter} from "next/navigation";
import {useDocsContext} from "@/context/DocsContext";
import {useEffect} from "react";
import {redirectToDeepestMenu} from "@/util/common/menu-redirect";

export default function DocsFirstPage() {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu] = pathSegs; // mainMenu: docs, subMenu: proof

  const {docsMenus} = useDocsContext();

  useEffect(() => {
    if (docsMenus && Array.isArray(docsMenus) && docsMenus.length > 0) {
      redirectToDeepestMenu(docsMenus, mainMenu, subMenu, router, pathname);
    }
  }, [docsMenus, subMenu, router, pathname]);
}
