"use client";
import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import dayjs from "dayjs";

import {useUserContext} from "@/context/UserContext";
import {usePollContext} from "@/context/PollContext";
import {UrlEnum} from "./etc/url.enum";

import {requestPost} from "@/util/api/api-service";
import {LocalStorage} from "@/util/common/storage";
import {ResponseStatus} from "@/types/poll.type";

import Pagination from "@/components/common/layout/Pagination";
import NewListContentCard from "@/components/common/layout/NewListContentCard";
import {StatusBoxItem} from "@/components/common/segment/etc/list-content-card.type";

export default function PollList({
	menuNodeMap,
}: {
	menuNodeMap: Record<string, () => any>;
}) {
	const {matchUserIdToRank} = useUserContext();
	const {paginatedList, setPaginatedList, dispatch} = usePollContext();
	const {results, totalPage} = paginatedList;
	const userId = LocalStorage.getUserId();

	const pathname = usePathname();
	const pathSegs = pathname.split("/");
	const [_, mainMenu, subMenu] = pathSegs; // mainMenu: community
	const router = useRouter();

	// 페이지네이션 처리
	const [currentPage, setCurrentPage] = useState(1);
	const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

	useEffect(() => {
		if (subMenu) getPaginatedPolls(subMenu, currentPage);
	}, [subMenu, currentPage]);

	async function getPaginatedPolls(menuId: string, page?: number) {
		const buildParam = menuNodeMap[menuId];
		const option = buildParam ? buildParam() : {};
		option.page = page ?? currentPage;

		console.log("option", option);

		const res = await requestPost("/poll/getPaginatedPolls", {option});
		if (res.statusCode === 200) {
			setPaginatedList(res.data);
		}
	}

	function onClickTitle(pollIdx: number) {
		dispatch({
			type: "SET_MODE",
			payload: "view",
		});
		const url = `/${mainMenu}/${subMenu}/${UrlEnum.GUIDE}/${pollIdx}`;
		router.push(url);
	}

	function checkIsResponded(poll: any) {
		const completedUsers = poll.respondents?.filter(
			(resp: any) =>
				resp.userId === userId &&
				resp.responseStatus === ResponseStatus.COMPLETED
		);
		const responded = completedUsers.some((u: any) => u.userId === userId);
		return responded;
	}

	const currentTime = dayjs().toISOString(); // 현재 시각

	const createStatusBox = (
		isInProgress: boolean,
		isResponded: boolean
	): StatusBoxItem[] => {
		const statusItems: StatusBoxItem[] = [];

		switch (isInProgress) {
			case true:
				statusItems.push({text: "진행 중", color: "green"});
				break;
			case false:
				statusItems.push({text: "종료", color: "gray"});
				break;
			default:
				break;
		}

		switch (isResponded) {
			case true:
				statusItems.push({text: "응답 완료", color: "blue"});
				break;
			case false:
				statusItems.push({text: "미응답", color: "red"});
				break;
			default:
				break;
		}
		return statusItems;
	};

	return (
		<>
			{results.map((poll, i) => {
				const isInProgress =
					poll?.startedAt &&
					poll?.endedAt &&
					currentTime < poll?.endedAt;
				const isResponded = checkIsResponded(poll);
				const statusBox = createStatusBox(isInProgress, isResponded);

				return (
					<NewListContentCard
						key={i}
						title={poll?.title}
						creator={matchUserIdToRank(poll?.creatorId)}
						createdAt={poll?.createdAt}
						onClickTitle={() => onClickTitle(poll?.pollIdx)}
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
