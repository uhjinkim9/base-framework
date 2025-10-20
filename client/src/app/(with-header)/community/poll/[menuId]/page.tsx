"use client";
import {useParams} from "next/navigation";
import {usePollContext} from "@/context/PollContext";

import {snakeToPascal} from "@/util/helpers/case-converter";

import AddPoll from "@/components/src/community/poll/AddPoll";
import PollList from "@/components/src/community/poll/PollList";

export default function MailMainPage() {
	const params = useParams();
	const menuId = String(params.menuId);
	const {pollMenus} = usePollContext();

	const menuNodeMap = pollMenus.reduce<Record<string, () => any>>(
		(acc, pm) => {
			// acc[menuId]로 인덱싱하여 값 저장
			acc[pm.menuId] = () => ({
				menuId: pm.menuId,
			});
			return acc;
		},
		{}
	);
	const isMenu = Object.keys(menuNodeMap).some((key) => menuId.includes(key));

	const ComponentMap: Record<string, React.FC> = {
		AddPoll,
	};
	const pascalName = snakeToPascal(menuId);
	const Component = ComponentMap[pascalName];

	return (
		<>
			{/* 사이드바 메뉴에 따라 페이지 구분 */}
			{isMenu && <PollList menuNodeMap={menuNodeMap} />}
			{Component && <Component />}
		</>
	);
}
