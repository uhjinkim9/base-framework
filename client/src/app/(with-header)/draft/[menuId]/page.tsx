"use client";
import { useParams, usePathname, useRouter } from "next/navigation";

import { useDraftContext } from "@/context/DraftContext";
import { redirectToFirstDraftLeafMenu } from "@/util/common/menu-redirect";
import { isEmpty } from "lodash";
import { SideBarMenuType } from "@/types/menu.type";
import { useEffect } from "react";
import { isNotEmpty } from "@/util/validators/check-empty";

export default function DraftMenuPage() {
  const params = useParams();
  const router = useRouter();
  const headerMenuId = String(params.menuId); // "draft-dashboard", "approval", "document"

  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu] = pathSegs;

  const { draftMenus } = useDraftContext();

  // 헤더 메뉴 ID에 따라 적절한 하위 메뉴로 리다이렉트
  // redirectToFirstDraftLeafMenu(draftMenus, headerMenuId, router);

  function combineFirstLeafMenuLink(): string {
    // console.log("2.combineFirstLeafMenuLink", draftMenus);
    if (isEmpty(draftMenus)) return "";
    let linkToLeafMenu = "";

    //upperNode와 일치하는 첫번째 노드 찾기
    let firstLeafMenu = draftMenus.find(
      (am: SideBarMenuType) => am.isUsed && am.upperNode === subMenu
    );
    console.log("firstLeafMenu", firstLeafMenu);
    if (firstLeafMenu === undefined) {
      linkToLeafMenu = `${subMenu}/${subMenu}`;
    } else {
      //일치하는 노드가 있으면
      linkToLeafMenu = `${subMenu}/${firstLeafMenu?.menuId}`;
    }

    return linkToLeafMenu;
  }

  function redirectToLeafMenu() {
    const link = combineFirstLeafMenuLink();
    router.push(link);
  }

  useEffect(() => {
    if (isNotEmpty(draftMenus)) redirectToLeafMenu();
  }, [draftMenus]);

  return null; // 리다이렉트만 수행하므로 렌더링 없음
}
