import {SideBarMenuType} from "@/types/menu.type";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

/**
 * 첫 번째 활성화된 메뉴로 리다이렉트하는 공통 함수
 * @param menuData - 메뉴 배열 데이터
 * @param mainMenu - 메인 메뉴 경로 (예: "community")
 * @param subMenu - 현재 서브메뉴 경로 (예: "board", "poll", "admin")
 * @param router - Next.js router 객체
 * @returns 생성된 링크 또는 빈 문자열
 */
export function redirectToFirstLeafMenu(
  menuData: SideBarMenuType[] | any,
  mainMenu: string,
  subMenu: string,
  router: ReturnType<typeof useRouter>,
): string {
  // 실제 데이터가 없으면 빈 문자열 반환
  if (!menuData || !Array.isArray(menuData) || menuData.length === 0) {
    return "";
  }

  // nodeLevel === 1이고 seqNum === 1인 첫 번째 메뉴 찾기
  const firstLeafMenu = menuData.find((menu: SideBarMenuType) => {
    const seqNum =
      typeof menu.seqNum === "string" ? parseInt(menu.seqNum) : menu.seqNum;
    return seqNum === 1 && menu.nodeLevel === 1 && menu.isUsed;
  });

  let targetMenu;

  if (firstLeafMenu) {
    // firstLeafMenu가 있으면 그 children에서 seqNum === 1인 메뉴 찾기
    const secondLeafMenu = firstLeafMenu.children?.find(
      (child: SideBarMenuType) => {
        const seqNum =
          typeof child.seqNum === "string"
            ? parseInt(child.seqNum)
            : child.seqNum;
        return seqNum === 1 && child.isUsed;
      },
    );

    // secondLeafMenu가 있으면 그것을, 없으면 firstLeafMenu 사용
    targetMenu = secondLeafMenu || firstLeafMenu;
  } else {
    // firstLeafMenu가 없으면 nodeLevel 2, seqNum 1인 메뉴 직접 찾기
    targetMenu = menuData.find((menu: SideBarMenuType) => {
      const seqNum =
        typeof menu.seqNum === "string" ? parseInt(menu.seqNum) : menu.seqNum;
      return seqNum === 1 && menu.nodeLevel === 2 && menu.isUsed;
    });
  }

  // 메뉴ID가 없으면 빈 문자열 반환
  if (!targetMenu?.menuId) {
    return "";
  }
  const linkToLeafMenu = `/${mainMenu}/${subMenu}/${targetMenu.menuId}`;
  router.push(linkToLeafMenu);

  return linkToLeafMenu;
}

/**
 * 메뉴 데이터 로딩 감지 및 자동 리다이렉트 훅
 * URL 1번째 slug 있으면 3번째 slug까지 자동 완성
 *
 * @param menuData - 메뉴 배열 데이터
 * @param mainMenu - 메인 메뉴 경로
 * @param subMenu - 현재 서브메뉴 경로
 * @param router - Next.js router 객체
 */
export function useMenuRedirect(
  menuData: SideBarMenuType[] | any,
  mainMenu: string,
  subMenu: string,
  router: ReturnType<typeof useRouter>,
) {
  useEffect(() => {
    // 실제 데이터가 있을 때만 리다이렉트 실행
    if (menuData && Array.isArray(menuData) && menuData.length > 0) {
      redirectToFirstLeafMenu(menuData, mainMenu, subMenu, router);
    }
  }, [menuData, subMenu, router]);
}

/*************************** 전자결재, 제증명과 같은 경우 사용 ***************************/

/**
 * 4단계 메뉴 구조를 위한 통합 리다이렉트 함수
 * subMenu → thirdSlug → fourthSlug (선택적) 형태로 리다이렉트
 * ex. /docs/proof → /docs/proof/dashboard/status-dashboard
//  */
// export function redirectToDeepestMenu(
//   menuData: SideBarMenuType[] | any,
//   mainMenu: string, // docs
//   subMenu: string, // proof
//   router: ReturnType<typeof useRouter>,
//   pathname: string, // 현재 경로 전달받기
// ): string {
//   // 실제 데이터가 없으면 빈 문자열 반환
//   if (!menuData || !Array.isArray(menuData) || menuData.length === 0) {
//     return "";
//   }

//   // thirdMenu 찾기: subMenu가 upperNode이며 seqNum이 1인 것
//   const thirdMenu = menuData.find((menu: SideBarMenuType) => {
//     return (
//       Number(menu.seqNum) === 1 &&
//       menu.upperNode === subMenu &&
//       menu.nodeLevel === 1 &&
//       menu.isUsed
//     );
//   });

//   if (thirdMenu?.menuId) {
//     const thirdSlug = thirdMenu.menuId;

//     // thirdMenu에 children이 있는지 확인
//     if (thirdMenu.children && thirdMenu.children.length > 0) {
//       // fourthMenu 찾기: children에서 seqNum === 1이고 nodeLevel이 2인 것
//       const fourthMenu = thirdMenu.children.find((child: SideBarMenuType) => {
//         return (
//           Number(child.seqNum) === 1 && child.nodeLevel === 2 && child.isUsed
//         );
//       });

//       if (fourthMenu?.menuId) {
//         const fourthSlug = fourthMenu.menuId;
//         const linkToLeafMenu = `/${mainMenu}/${subMenu}/${thirdSlug}/${fourthSlug}`;
//         if (pathname !== linkToLeafMenu) {
//           router.push(linkToLeafMenu);
//         }
//         return linkToLeafMenu;
//       }
//     }

//     // children이 없거나 fourthMenu를 찾지 못한 경우 3단계까지만
//     const linkToLeafMenu = `/${mainMenu}/${subMenu}/${thirdSlug}`;
//     if (pathname !== linkToLeafMenu) {
//       router.push(linkToLeafMenu);
//     }
//     return linkToLeafMenu;
//   }

//   // fallback: nodeLevel 1이 없으면 nodeLevel 2에서 직접 찾기
//   const directLeafMenu = menuData.find((menu: SideBarMenuType) => {
//     return (
//       Number(menu.seqNum) === 1 &&
//       menu.upperNode === subMenu &&
//       menu.nodeLevel === 2 &&
//       menu.isUsed
//     );
//   });

//   if (directLeafMenu?.menuId) {
//     const linkToLeafMenu = `/${mainMenu}/${subMenu}/${directLeafMenu.menuId}`;
//     if (pathname !== linkToLeafMenu) {
//       router.push(linkToLeafMenu);
//     }
//     return linkToLeafMenu;
//   }

//   // 모든 경우에 해당하지 않으면 빈 문자열 반환
//   return "";
// }

export function redirectToDeepestMenu(
  menuData: SideBarMenuType[] | any,
  mainMenu: string,
  subMenu: string,
  router: ReturnType<typeof useRouter>,
  pathname: string,
): string {
  if (!menuData || !Array.isArray(menuData) || menuData.length === 0) {
    return "";
  }

  const thirdMenu = menuData.find((menu: SideBarMenuType) => {
    return (
      Number(menu.seqNum) === 1 &&
      menu.upperNode === subMenu &&
      menu.nodeLevel === 1 &&
      menu.isUsed
    );
  });

  if (thirdMenu?.menuId) {
    const thirdSlug = thirdMenu.menuId;

    if (thirdMenu.children && thirdMenu.children.length > 0) {
      const fourthMenu = thirdMenu.children.find((child: SideBarMenuType) => {
        return (
          Number(child.seqNum) === 1 && child.nodeLevel === 2 && child.isUsed
        );
      });

      if (fourthMenu?.menuId) {
        const fourthSlug = fourthMenu.menuId;
        const linkToLeafMenu = `/${mainMenu}/${subMenu}/${thirdSlug}/${fourthSlug}`;
        if (pathname !== linkToLeafMenu) {
          router.push(linkToLeafMenu);
        }
        return linkToLeafMenu;
      }
    }

    const linkToLeafMenu = `/${mainMenu}/${subMenu}/${thirdSlug}`;
    if (pathname !== linkToLeafMenu) {
      router.push(linkToLeafMenu);
    }
    return linkToLeafMenu;
  }

  const directLeafMenu = menuData.find((menu: SideBarMenuType) => {
    return (
      Number(menu.seqNum) === 1 &&
      menu.upperNode === subMenu &&
      menu.nodeLevel === 2 &&
      menu.isUsed
    );
  });

  if (directLeafMenu?.menuId) {
    const linkToLeafMenu = `/${mainMenu}/${subMenu}/${directLeafMenu.menuId}`;
    if (pathname !== linkToLeafMenu) {
      router.push(linkToLeafMenu);
    }
    return linkToLeafMenu;
  }

  return "";
}

/*************************** 전자결재 ***************************/
// TODO: 이 부분 나중에 리팩토링해야 할 듯

/**
 * Draft 메뉴 데이터 로딩 감지 및 자동 리다이렉트 훅
 * @param draftMenus - Draft 메뉴 배열 데이터
 * @param headerMenuId - 헤더 메뉴 ID ("draft-dashboard", "approval", "document")
 * @param router - Next.js router 객체
 */
export function useDraftMenuRedirect(
  draftMenus: SideBarMenuType[],
  headerMenuId: string,
  router: ReturnType<typeof useRouter>,
) {
  useEffect(() => {
    // 실제 데이터가 있을 때만 리다이렉트 실행
    if (draftMenus && Array.isArray(draftMenus) && draftMenus.length > 0) {
      redirectToFirstDraftLeafMenu(draftMenus, headerMenuId, router);
    }
  }, [draftMenus, headerMenuId, router]);
}

export function redirectToFirstDraftLeafMenu(
  draftMenus: SideBarMenuType[],
  headerMenuId: string, // "draft-dashboard", "approval", "document"
  router: ReturnType<typeof useRouter>,
): string {
  // 실제 데이터가 없으면 빈 문자열 반환
  if (!draftMenus || !Array.isArray(draftMenus) || draftMenus.length === 0) {
    return "";
  }

  // headerMenuId와 같은 이름의 폴더 메뉴 찾기
  const folderMenu = draftMenus.find(
    (menu) =>
      menu.nodeLevel === 1 && menu.menuNm === getMenuDisplayName(headerMenuId), // "approval" → "결재문서"
  );

  if (headerMenuId === "draft-dashboard") {
    // draft-dashboard는 자기 자신으로 이동
    const targetMenu = draftMenus.find(
      (menu) => menu.menuId === "draft-dashboard" && menu.nodeLevel === 2,
    );
    if (!targetMenu?.menuId) return "";
    const link = `/community/draft/${headerMenuId}/${targetMenu.menuId}`;
    router.push(link);
    return link;
  } else {
    // approval, document는 첫 번째 자식으로 이동
    const firstChild = folderMenu?.children?.find(
      (child) => child.seqNum === 1 && child.isUsed,
    );
    if (!firstChild?.menuId) return "";
    const link = `/community/draft/${headerMenuId}/${firstChild.menuId}`;
    router.push(link);
    return link;
  }
}

/**
 * 메뉴 ID를 한글 표시명으로 변환
 */
function getMenuDisplayName(menuId: string): string {
  const menuMapping: Record<string, string> = {
    "draft-dashboard": "대시보드",
    approval: "결재문서",
    document: "내문서",
  };
  return menuMapping[menuId] || menuId;
}
