"use client";
import styles from "./layout.module.scss";

import Breadcrumb from "@/components/common/layout/BreadCrumb";
import ContentCard from "@/components/common/layout/ContentCard";

import {BoardProvider} from "@/context/BoardContext";
import {PollProvider} from "@/context/PollContext";

import {usePathname} from "next/navigation";
import {snakeToPascal} from "@/util/helpers/case-converter";

import BoardSideBar from "@/components/src/community/board/BoardSideBar";
import PollSideBar from "@/components/src/community/poll/side-bar/PollSideBar";

export default function CommunityLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const menuNm = usePathname().split("/")[2];

	// PascalName 기준으로 사이드바 컴포넌트 등록
	const sideBarMap: Record<string, React.FC> = {
		BoardSideBar,
		PollSideBar,
		// ReferRoomSideBar
	};

	const pascalName = snakeToPascal(menuNm); // board → Board
	const componentKey = `${pascalName}SideBar`; // BoardSideBar
	const Cpnent = sideBarMap[componentKey];

	return (
		<BoardProvider>
			<PollProvider>
				<div className={styles.container}>
					<Breadcrumb />
					<div className={styles.screen}>
						{Cpnent && <Cpnent />}
						<ContentCard fullHeight={false}>
							<div className={styles.content}>{children}</div>
						</ContentCard>
					</div>
				</div>
			</PollProvider>
		</BoardProvider>
	);
}
