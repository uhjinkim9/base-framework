"use client";
import styles from "./styles/SideBar.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LocalStorage } from "@/util/common/storage";
import { checkIsManager } from "@/util/validators/check-manager";
import { PiPencilSimpleLight } from "react-icons/pi";
import { VscSettings } from "react-icons/vsc";

import Button from "../form-properties/Button";

type Props = {
  // 🧠 변경: 연필 버튼 사용 여부
  usingPencilBtn?: boolean;
  // 🧠 변경: 연필 버튼 사용 시 클릭 핸들러
  onClickPencilBtn?: any;
  // 🧠 변경: 내용물 알아서 처리
  children?: React.ReactNode;
};

export default function SideBar(props: Props) {
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu] = pathSegs; // mainMenu: admin, subMenu: admin-all
  const adminUrl = `/admin/admin-sub/admin-${subMenu}`;

  const [isManager, setIsManager] = useState(false);
  const userId = LocalStorage.getUserId();

  useEffect(() => {
    const checkRole = async () => {
      const role = await checkIsManager(userId);
      if (role) setIsManager(true);
    };
    checkRole();
  }, [userId]);

  // 🧠 변경: 호버 인덱스 상태 상위에서 함
  // const [hoveredIdx, setHoveredIdx] = useState<string | null>(null);

  // 🧠 변경: 사이드바 메뉴 데이터 상위에서 함
  // useEffect(() => {
  //   props.getMenus?.();
  // }, [subMenu]);

  // 🧠 변경: 렌더링 내용물도 상위에서 함
  // const renderMenuTree = (menu: any, isPsMenu: boolean = false) => {
  //   const isActive = menu?.menuId === leafMenu;

  //   const menuContentInner = (
  //     <>
  //       <div
  //         className={clsx(
  //           styles.menuContent,
  //           menu.nodeLevel === 1 ? styles.nodeFolder : ""
  //         )}>
  //         {props.usingCheckBox && (
  //           <CheckBox
  //             name={menu.menuIdx || menu.menuId || ""}
  //             checkValue={menu.menuIdx}
  //             value={props.checkedItems?.some(
  //               (checkedItem) => checkedItem.name === (menu.menuIdx || menu.id)
  //             )}
  //             onChange={props.onCheckItem}
  //             componentType="mark"
  //           />
  //         )}
  //         <span>{menu.menuNm}</span>
  //         {props.usingColorCircle && (
  //           <ColoredCircle colorCode={menu.menuColor || menu.color || "#000"} />
  //         )}
  //       </div>
  //     </>
  //   );

  // 	return (
  // 		<>
  // 			<li
  // 				key={menu.menuIdx}
  // 				className={clsx(
  // 					styles.subMenuItem,
  // 					isActive ? styles.active : ""
  // 				)}
  // 			>
  // 				<div
  // 					className={styles.menuItemWrapper}
  // 					onMouseEnter={
  // 						props.usingHoverEffect
  // 							? () => setHoveredIdx(menu.menuIdx ?? 0)
  // 							: undefined
  // 					}
  // 					onMouseLeave={
  // 						props.usingHoverEffect
  // 							? () => setHoveredIdx(null)
  // 							: undefined
  // 					}
  // 				>
  // 					{props.disactivatingLink ? (
  // 						<div>{menuContentInner}</div>
  // 					) : (
  // 						<Link
  // 							href={`/${mainMenu}/${menu.upperNode}/${menu.menuId}`}

  // 						>
  // 							{menuContentInner}
  // 						</Link>
  // 					)}
  // 					{isPsMenu && (
  // 						<span>
  // 							{props.usingHoverEffect &&
  // 								hoveredIdx === menu.menuIdx &&
  // 								menu.menuIdx !== undefined && (
  // 									<PiPencilSimpleLight
  // 										className={styles.buttonIcon}
  // 										onClick={() => {
  // 											props.onClickEditPsMenu?.(
  // 												menu.menuIdx as number
  // 											);
  // 											openModal();
  // 										}}
  // 									/>
  // 								)}
  // 						</span>
  // 					)}
  // 				</div>
  // 				{menu.children && menu.children.length > 0 && (
  // 					<ul className={styles.subMenuList}>
  // 						{menu.children.map((child: any) =>
  // 							<div key={child.menuIdx || child.menuId || child.id}>
  // 								{renderMenuTree(child, isPsMenu)}
  // 							</div>
  // 						)}
  // 					</ul>
  // 				)}
  // 			</li>
  // 		</>
  // 	);
  // };

  return (
    <div className={styles.container}>
      {props.usingPencilBtn ? (
        <Button componentType="primaryFirst" onClick={props.onClickPencilBtn}>
          <PiPencilSimpleLight className={styles.buttonIcon} />
        </Button>
      ) : null}

      <aside className={styles.menuColumn}>
        {/* 🧠 변경: children 자리 시작! */}
        {/* <div className={styles.menuSection}> */}
        {/* <ul className={styles.subMenuList}> */}
        {/* {props.cpMenus?.map((cp: any) => (
							<div key={cp.menuIdx || cp.menuId || cp.id}>
								{renderMenuTree(cp, false)}
							</div>
						))} */}
        {/* 🧠 변경: 내용물은 칠드런으로 알아서 */}
        {props.children}
        {/* </ul> */}

        {/* 개인 게시판 */}
        {/* {props.usingPsMenus && (
						<>
							<Divider type="soft" />
							<ul className={styles.subMenuList}>
								{props.psMenus?.map((ps: any) => (
									<div key={ps.menuIdx || ps.menuId || ps.id}>
										{renderMenuTree(ps, true)}
									</div>
								))}
							</ul>
						</>
					)} */}
        {/* </div> */}

        {/* <Divider type="soft" />
				<Button
					componentType="text"
					onClick={() => {
						props.onClickAddPsMenu?.();
						openModal();
					}}
				>
					추가
				</Button> */}
        {/* 🧠 변경: children 자리 끝! */}

        <div className={styles.settingButton}>
          {mainMenu === "admin" ? null : isManager ? (
            <Link href={adminUrl}>
              <Button componentType="transparent" onHoverOpaque={true}>
                <VscSettings />
              </Button>
            </Link>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
