"use client";
import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";

import {useUserContext} from "@/context/UserContext";
import {useDocsContext} from "@/context/DocsContext";
import {StatusBoxItem} from "@/components/common/segment/etc/list-content-card.type";
import {ProofUrlEnum} from "./etc/url.enum";
import {DocStatusEnum} from "./etc/docs.type";

import {requestPost} from "@/util/api/api-service";
import {saveLastUrl} from "@/util/common/last-url";

import Pagination from "@/components/common/layout/Pagination";
import NewListContentCard from "@/components/common/layout/NewListContentCard";
import IconImage from "@/components/common/segment/IconImage";

export default function ProofList({
	menuNodeMap,
}: {
	menuNodeMap: Record<string, () => any>;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [_, mainMenu, subMenu, leafMenu] = pathname.split("/"); // mainMenu: docs, subMenu: proof

	// 게시물 데이터 불러오기
	const {paginatedList, setPaginatedList} = useDocsContext();
	const {results, totalPage} = paginatedList;
	const {matchUserIdToRank} = useUserContext();

	// 페이지네이션 처리
	const [currentPage, setCurrentPage] = useState(1);
	const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
	useEffect(() => {
		if (subMenu) getPaginatedProofs(subMenu, currentPage);
	}, [subMenu, currentPage]);

	async function getPaginatedProofs(menuId: string, page?: number) {
		const buildParam = menuNodeMap[menuId];
		const option = buildParam ? buildParam() : {};
		option.page = page ?? currentPage;

		const res = await requestPost("/docs/getPaginatedProofs", {option});
		if (res.statusCode === 200) {
			setPaginatedList(res.data);
		}
	}

	function onClickTitle(docIdx: number) {
		saveLastUrl(pathname);
		const baseUrl = `/${mainMenu}/${subMenu}`;
		const userProofUrl = `${baseUrl}/${ProofUrlEnum.VIEW_PROOF}/${docIdx}`;
		const managerProofUrl = `${baseUrl}/${ProofUrlEnum.RECEIVED_REQ}/${docIdx}`;
		if (leafMenu === "manager") {
			// 관리자일 경우
			router.push(managerProofUrl);
			return;
		} else {
			router.push(userProofUrl);
		}
	}

	const createStatusBox = (
		docStatus: string,
		isUrgent: boolean
	): StatusBoxItem[] => {
		const statusItems: StatusBoxItem[] = [];

		switch (isUrgent) {
			case true:
				statusItems.push({
					text: <IconImage iconName="warning_diamond" />,
					color: "transparent",
				});
				break;
		}
		switch (docStatus) {
			case DocStatusEnum.SUBMITTED:
				statusItems.push({text: "대기", color: "orange"});
				break;
			case DocStatusEnum.CANCELED:
				statusItems.push({text: "취소", color: "gray"});
				break;
			case DocStatusEnum.REJECTED:
				statusItems.push({text: "반려", color: "yellow"});
				break;
			case DocStatusEnum.APPROVED:
				statusItems.push({text: "승인", color: "blue"});
				break;
			default:
				break;
		}
		return statusItems;
	};

	return (
		<>
			{results.map((doc: any, i: any) => {
				const statusBox = createStatusBox(
					doc?.status || "",
					doc?.isUrgent
				);

				return (
					<NewListContentCard
						key={i}
						title={doc?.docNm}
						creator={matchUserIdToRank(doc?.creatorId)}
						createdAt={doc?.createdAt}
						onClickTitle={() => onClickTitle(doc?.idx)}
						statusBox={statusBox}
					/>
				);
			})}

			<Pagination
				currentPage={currentPage}
				totalPages={totalPage}
				onPageChange={paginate}
			></Pagination>
		</>
	);
}
