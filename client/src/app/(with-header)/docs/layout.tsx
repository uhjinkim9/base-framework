"use client";
import styles from "./layout.module.scss";
import {usePathname} from "next/navigation";

import {snakeToPascal} from "@/util/helpers/case-converter";
import {DocsProvider} from "@/context/DocsContext";

import Breadcrumb from "@/components/common/layout/BreadCrumb";
import DocsSideBar from "@/components/src/docs/side-bar/DocsSideBar";

export default function DocsLayout({children}: {children: React.ReactNode}) {
	const menuId = usePathname().split("/")[1];
	const pascalName = snakeToPascal(menuId);

	const sideBarMap: Record<string, React.FC> = {
		DocsSideBar,
	};

	if (!menuId) return null;
	const componentKey = `${pascalName}SideBar`;
	const Cpnent = sideBarMap[componentKey];

	return (
		<DocsProvider>
			<div className={styles.container}>
				<Breadcrumb />
				<div className={styles.screen}>
					{Cpnent ? (
						<Cpnent />
					) : (
						<div>사이드바 컴포넌트 없음: {pascalName}</div>
					)}
					<div className={styles.content}>{children}</div>
				</div>
			</div>
		</DocsProvider>
	);
}
