"use client";
import styles from "./styles/MailList.module.scss";

import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";

import {useUserContext} from "@/context/UserContext";
import {useMailContext} from "@/context/MailContext";

import {requestPost} from "@/util/api/api-service";
import {saveLastUrl} from "@/util/common/last-url";

import Pagination from "@/components/common/layout/Pagination";
import MailListLine from "./MailListLine";
import MailHeaderBtnGroup from "./inner/MailHeaderBtnGroup";

export default function MailList({
	menuNodeMap,
	activeMenuId,
}: {
	menuNodeMap: Record<string, () => any>;
	activeMenuId: string;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [_, mainMenu, subMenu] = pathname.split("/"); // mainMenu: mail

	// 게시물 데이터 불러오기
	const {paginatedList, setPaginatedList} = useMailContext();
	const {results, totalPage} = paginatedList;
	const {matchUserIdToRank} = useUserContext();

	// 페이지네이션 처리
	const [currentPage, setCurrentPage] = useState(1);
	const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
	useEffect(() => {
		if (!activeMenuId) return;
		if (!menuNodeMap[activeMenuId]) return;
		getPaginatedMails(activeMenuId, currentPage);
	}, [activeMenuId, currentPage]);

	async function getPaginatedMails(menuId: string, page?: number) {
		const buildParam = menuNodeMap[menuId];
		if (!buildParam) return;
		const option = {...buildParam()};
		option.page = page ?? currentPage;

		const res = await requestPost("/mail/getPaginatedMails", {option});
		if (res.statusCode === 200) {
			setPaginatedList(res.data);
			console.log("paginated mails", res.data);
		}
	}

	function onClickTitle(mailIdx: number) {
		saveLastUrl(pathname);
		const baseUrl = `/${mainMenu}/${subMenu}/mail-view/${mailIdx}`; //TODO: 하드코딩 풀기
		router.push(baseUrl);
	}

	return (
		<>
			<div className={styles.mailListContainer}>
				<MailHeaderBtnGroup containingIcons />

				<MailListLine
					title={"ㅌㅅㅌㅅㅌㅅ"}
					creator={matchUserIdToRank("ejkim")}
					createdAt={new Date("2025-09-16T10:15:30")}
					onClickTitle={() => onClickTitle(1)}
					isImportant
					isRead
				/>
				<MailListLine
					title={"ㅌㅅㅌㅅㅌㅅ"}
					creator={matchUserIdToRank("ejkim")}
					createdAt={new Date("2025-09-16T10:15:30")}
					onClickTitle={() => onClickTitle(1)}
					isImportant
				/>
				<MailListLine
					title={"ㅌㅅㅌㅅㅌㅅ"}
					creator={matchUserIdToRank("ejkim")}
					createdAt={new Date("2025-09-16T10:15:30")}
					onClickTitle={() => onClickTitle(1)}
				/>
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPage}
				onPageChange={paginate}
			></Pagination>
		</>
	);
}
