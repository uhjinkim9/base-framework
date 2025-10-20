/**
 * @fileoverview Breadcrumb 컴포넌트
 * @description 현재 페이지의 경로를 메뉴 이름 기준으로 표시하는 네비게이션 컴포넌트
 *
 * @component
 * - 현재 URL 경로(`pathname`)를 기반으로 메뉴 ID를 추출하고, `menuData`에서 해당 메뉴명을 매칭하여 표시함
 * - 마지막 경로는 활성화 스타일을 적용하며 링크로 제공되지 않음
 * - 메뉴명을 기준으로 페이지의 서브 타이틀도 함께 출력
 *
 * @author 김어진
 */

"use client";
import {usePathname} from "next/navigation";
import Link from "next/link";
import styles from "./styles/BreadCrumb.module.scss";
import {useMenuData} from "@/context/MenuContext";
import SubTitle from "@/components/common/segment/SubTitle";
import {isNotEmpty} from "@/util/validators/check-empty";

// 메뉴가 DB에 없을 때 예외 하드코딩
const specialRoutes: Record<string, string> = {
	"write-post": "글쓰기",
};

export default function Breadcrumb() {
	const pathname = usePathname();
	const pathSegments = pathname
		.split("/")
		.filter((segment) => segment)
		.slice(0, 2);
	const {menuData} = useMenuData();
	let subTitleName = "";
	return (
		<div className={styles.container}>
			<nav className={styles.breadCrumb}>
				<ul>
					<li>
						<Link href="/home">홈</Link>
					</li>

					{pathSegments.map((segment, index) => {
						const matchedSegment = menuData.find(
							(menu) => menu.menuId === segment
						);

						let isLast;
						let path = "";
						let krMenuNm = "";
						let nodeLevel = 0;

						// 브레드크럼에서 대분류 메뉴 클릭했을 때: 해당 대분류 메뉴를 어퍼 노드로 가지는 첫번째 서브 메뉴 찾는 로직
						if (
							matchedSegment &&
							isNotEmpty(matchedSegment) &&
							matchedSegment.nodeLevel === 1
						) {
							nodeLevel = 1;
							const filtered1 = menuData.filter(
								(menu) => menu.menuId === segment
							)[0];
							const filtered2 = menuData.filter(
								(menu) =>
									menu.upperNode === filtered1.menuId &&
									Number(menu.seqNum) === 1
							)[0];

							krMenuNm = filtered1.menuNm;
							subTitleName = krMenuNm;
							path = `/${filtered1.menuId}/${filtered2.menuId}`;

							// 브레드크럼에서 중분류 메뉴 클릭했을 때: pathname 통해 메뉴 경로 추출
						} else if (specialRoutes[segment]) {
							krMenuNm = specialRoutes[segment];
							subTitleName = krMenuNm;
						} else {
							nodeLevel = 2;
							krMenuNm = matchedSegment
								? matchedSegment.menuNm
								: "";
							subTitleName = krMenuNm;

							path = `/${pathSegments
								.slice(0, index + 1)
								.join("/")}`;
							isLast = index === pathSegments.length - 1; // 마지막 경로 여부 확인
						}

						return (
							<li
								key={path + nodeLevel}
								className={isLast ? styles.active : ""}
							>
								<Link href={path}>
									<span>
										{decodeURIComponent(subTitleName)}
									</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>
			<SubTitle>{subTitleName ? subTitleName : "글쓰기"}</SubTitle>
		</div>
	);
}
