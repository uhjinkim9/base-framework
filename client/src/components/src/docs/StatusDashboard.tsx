"use client";
import style from "./styles/StatusDashboard.module.scss";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";

import {GoChecklist} from "react-icons/go";
import {ProofUrlEnum} from "./etc/url.enum";
import {requestPost} from "@/util/api/api-service";
import AlertService from "@/services/alert.service";

import Card from "@/components/common/layout/Card";
import SpaceInCard from "@/components/common/layout/SpaceInCard";
import SubTitle from "@/components/common/segment/SubTitle";
import StatusItem from "@/components/common/segment/StatusItem";
import CountingItem from "@/components/common/segment/CountingItem";
import {DocType} from "./etc/docs.type";
import {fullDateWithLabel} from "@/util/helpers/formatters";
import {useUserContext} from "@/context/UserContext";

type CountData = {
	status: string;
	count: string;
};

type DashBoardType = {
	userDashBoard: CountData[];
	managerDashBoard: CountData[];
	recentIssued: Partial<DocType>[];
	recentRequested: Partial<DocType>[];
};

const statusKorMap: Record<string, string> = {
	submitted: "대기",
	approved: "완료",
	rejected: "반려",
	canceled: "취소",
	"(Unknown)": "-",
};

export default function StatusDashboard() {
	const pathname = usePathname();
	const [_, mainMenu, subMenu] = pathname.split("/"); // mainMenu: docs, subMenu: proof, leafMenu: dashboard
	const baseUrl = `/${mainMenu}/${subMenu}`;
	const statusUrl = `${baseUrl}/${ProofUrlEnum.STATUS}`;
	const statusViewUrl = `${baseUrl}/${ProofUrlEnum.VIEW_PROOF}`;
	const managerUrl = `${baseUrl}/${ProofUrlEnum.MANAGER}`;
	const managerViewUrl = `${baseUrl}/${ProofUrlEnum.RECEIVED_REQ}`;

	const [dashBoard, setDashBoard] = useState<DashBoardType | null>(null);
	const {matchUserIdToRank} = useUserContext();

	const getProofDashboard = async () => {
		const res = await requestPost("/docs/getProofDashboard");
		if (res.statusCode === 200) {
			AlertService.success("대시보드 데이터를 조회했습니다.");
			setDashBoard(res.data);
			console.log("응답 성공 데이터:", res.data);
		}
	};

	const findCount = (status: string, type: "user" | "manager"): number => {
		if (!dashBoard) return 0;
		const item =
			type === "user"
				? dashBoard.userDashBoard.find(
						(entry) => entry.status === status
				  )
				: dashBoard.managerDashBoard.find(
						(entry) => entry.status === status
				  );
		return item ? parseInt(item.count, 10) : 0;
	};

	useEffect(() => {
		getProofDashboard();
	}, []);

	// 신청 현황 데이터
	const userStatusItems = [
		{
			title: "전체",
			status: "all",
			link: `${statusUrl}/${ProofUrlEnum.STATUS_ALL}`,
		},
		{
			title: "대기",
			status: "submitted",
			link: `${statusUrl}/${ProofUrlEnum.STATUS_WAIT}`,
		},
		{
			title: "완료/취소",
			status: "approved",
			link: `${statusUrl}/${ProofUrlEnum.STATUS_DONE}`,
		},
	];

	// 받은 요청 현황 데이터
	const managerStatusItems = [
		{
			title: "대기",
			status: "submitted",
			link: `${managerUrl}/${ProofUrlEnum.RECEIVED_REQ}`,
		},
		{
			title: "승인",
			status: "approved",
			link: `${managerUrl}/${ProofUrlEnum.APPROVED_REQ}`,
		},
		{
			title: "반려",
			status: "rejected",
			link: `${managerUrl}/${ProofUrlEnum.REJECTED_REQ}`,
		},
	];

	return (
		<div className={style.container}>
			<div className={style.containerLeft}>
				<Card>
					<SpaceInCard>
						<SubTitle icon={<GoChecklist />}>
							<>신청 현황</>
						</SubTitle>
						{userStatusItems.map((item, index) => (
							<div key={index} className={style.summaryWrap}>
								<CountingItem
									title={item.title}
									darkMode={true}
									count={findCount(item.status, "user")}
									link={item.link}
								/>
							</div>
						))}
					</SpaceInCard>
				</Card>

				<Card>
					<SpaceInCard>
						<SubTitle icon={<GoChecklist />}>
							<>받은 요청 현황</>
						</SubTitle>
						{managerStatusItems.map((item, index) => (
							<div key={index} className={style.summaryWrap}>
								<CountingItem
									title={item.title}
									count={findCount(item.status, "manager")}
									link={item.link}
								/>
							</div>
						))}
					</SpaceInCard>
				</Card>
			</div>

			<div className={style.containerRight}>
				<Card>
					<SpaceInCard>
						<SubTitle icon={<GoChecklist />}>
							<>최근 발급</>
						</SubTitle>
						{dashBoard?.recentIssued
							?.slice(0, 3)
							.map((item, index) => (
								<StatusItem
									key={index}
									darkMode={true}
									statusText={
										statusKorMap[
											item?.status || "(Unknown)"
										]
									}
									name={matchUserIdToRank(
										item?.creatorId || "(Unknown)"
									)}
									date={
										fullDateWithLabel(
											item?.createdAt ?? new Date()
										) || "(Unknown)"
									}
									subject={item?.docNm || "(Unknown)"}
									link={`${statusViewUrl}/${item?.idx}`}
								/>
							))}
					</SpaceInCard>
				</Card>

				<Card>
					<SpaceInCard>
						<SubTitle icon={<GoChecklist />}>
							<>최근 받은 요청</>
						</SubTitle>
						{dashBoard?.recentRequested
							?.slice(0, 3)
							.map((item, index) => (
								<StatusItem
									key={index}
									statusText={
										statusKorMap[
											item?.status || "(Unknown)"
										]
									}
									name={matchUserIdToRank(
										item?.creatorId || "(Unknown)"
									)}
									date={
										fullDateWithLabel(
											item?.createdAt || new Date()
										) || "(Unknown)"
									}
									subject={item?.docNm || "(Unknown)"}
									link={`${managerViewUrl}/${item?.idx}`}
								/>
							))}
					</SpaceInCard>
				</Card>
			</div>
		</div>
	);
}
