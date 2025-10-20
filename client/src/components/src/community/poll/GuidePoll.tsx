"use client";
import {useEffect} from "react";
import {useParams, useRouter, usePathname} from "next/navigation";

import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import PollInfo from "./PollInfo";

import {requestPost} from "@/util/api/api-service";
import {LocalStorage} from "@/util/common/storage";
import {usePollContext} from "@/context/PollContext";
import AlertService from "@/services/alert.service";
import {UrlEnum} from "./etc/url.enum";

export default function GuidePoll() {
	const {state, dispatch} = usePollContext();
	const {poll} = state;

	const pathname = usePathname();
	const pathSegs = pathname.split("/");
	const [_, mainMenu, subMenu] = pathSegs; // mainMenu: community
	const router = useRouter();

	const params = useParams();
	const pollIdx = Number(params.pollIdx);

	function onClickEdit() {
		dispatch({type: "SET_MODE", payload: "edit"});
		router.push(`/${mainMenu}/${subMenu}/${UrlEnum.ADD}`);
	}

	function onClickResult() {
		dispatch({
			type: "SET_MODE",
			payload: "result",
		});
		const url = `/${mainMenu}/${subMenu}/${UrlEnum.RESULT}/${pollIdx}`;
		router.push(url);
	}

	function onClickRespond() {
		const url = `/${mainMenu}/${subMenu}/${UrlEnum.RESPOND}/${pollIdx}`;
		router.push(url);
	}

	async function onDelete() {
		const res = await requestPost("/poll/deletePoll", {
			pollIdx: pollIdx,
		});
		if (res.statusCode === 200) {
			const url = `/${mainMenu}/${subMenu}`;
			router.push(url);
			AlertService.success("설문이 삭제되었습니다.");
			dispatch({type: "RESET"});
		}
	}

	useEffect(() => {
		getPollBasic();
		dispatch({type: "SET_SELECTED", payload: pollIdx});
	}, [pollIdx]);

	async function getPollBasic() {
		const res = await requestPost("/poll/getPollBasic", {
			pollIdx: pollIdx,
		});
		if (res.statusCode === 200) {
			dispatch({type: "SET_POLL", payload: res.data});
		}
	}

	const userId = LocalStorage.getUserId();

	/** 설문 관리 옵션 */
	const isCreator = poll.creatorId === userId; // 등록자 여부
	const isRespondent = poll.respondents?.some((r) => r.userId === userId); // 응답자 여부
	const alreadyResponded = poll.respondents?.find(
		(r) => r.userId === userId && r.responseStatus === "COMPLETED"
	); // 기응답자 여부
	const isFinished = new Date(poll.endedAt || "") < new Date(); // 마감 여부

	// 1. '수정' 가능 대상
	const isEditable = !isFinished && isCreator; // || 관리자일 때(creator와 함께 괄호)
	// 2. '결과 조회' 가능 대상
	const resultOpened = isCreator || poll.revealResult; // || 관리자일 때
	// 3. '응답' 가능 대상
	const isRespondable =
		isRespondent &&
		!isFinished &&
		(poll.modifyAfterAnswered ? true : !alreadyResponded);
	// 4. '삭제' 가능 대상
	const isRemovable = isCreator; // || 관리자일 때

	return (
		<div>
			<PollInfo />
			<CommonButtonGroup
				usedButtons={{
					btnShowResult: resultOpened, // 등록자 or 관리자 or 결과 공개일 경우 true
					btnEdit: isEditable,
					btnRespond: isRespondable,
					btnDelete: isRemovable,
					btnList: true,
				}}
				onEdit={onClickEdit}
				onShowResult={onClickResult}
				onRespond={onClickRespond}
				onDelete={onDelete}
			></CommonButtonGroup>
		</div>
	);
}
