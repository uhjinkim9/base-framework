"use client";
import {useParams} from "next/navigation";
import {useBoardContext} from "@/context/BoardContext";

import {LocalStorage} from "@/util/common/storage";
import {snakeToPascal} from "@/util/helpers/case-converter";

import PostList from "@/components/src/community/board/PostList";
import AddPost from "@/components/src/community/board/AddPost";

export default function BoardMainPage() {
	const params = useParams();
	const menuId = String(params.menuId);
	console.log(menuId);

	const {boardMenus} = useBoardContext();
	const boards = [...boardMenus.cpBoards, ...boardMenus.psBoards];

	const menuNodeMap = boards.reduce<Record<string, () => any>>((acc, bm) => {
		// acc[menuId]로 인덱싱하여 값 저장
		acc[bm.menuId] = () => ({
			menuId: bm.menuId,
		});
		return acc;
	}, {});
	const isMenu = Object.keys(menuNodeMap).some((key) => menuId.includes(key));

	const ComponentMap: Record<string, React.FC> = {
		AddPost,
	};
	const pascalName = snakeToPascal(menuId);
	const Component = ComponentMap[pascalName];

	return (
		<>
			{/* 사이드바 메뉴에 따라 페이지 구분 */}
			{isMenu && <PostList menuNodeMap={menuNodeMap} />}
			{Component && <Component />}
		</>
	);
}
