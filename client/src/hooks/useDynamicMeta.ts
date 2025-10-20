"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";
import {useBoardContext} from "@/context/BoardContext";

interface MetaData {
	title: string;
	description: string;
	keywords?: string;
	type?: string;
	url?: string;
}

export function useDynamicMeta(customMeta?: Partial<MetaData>) {
	const pathname = usePathname();
	const {boardMenus} = useBoardContext();

	useEffect(() => {
		const pathSegments = pathname.split("/").filter(Boolean);
		const [mainMenu, subMenu, leafMenu, sideMain] = pathSegments;

		// 기본 메타데이터 생성
		const baseMeta = generateBaseMeta(
			mainMenu,
			subMenu,
			leafMenu,
			sideMain,
			boardMenus
		);

		// 커스텀 메타데이터와 병합
		const finalMeta = {...baseMeta, ...customMeta};

		// 동적으로 head 태그 업데이트
		updateMetaTags(finalMeta);

		// 페이지 제목 업데이트
		document.title = finalMeta.title;
	}, [pathname, customMeta, boardMenus]);
}

function generateBaseMeta(
	mainMenu: string,
	subMenu: string,
	leafMenu: string,
	sideMain: string,
	boardMenus: any
): MetaData {
	const siteName = "uCubers Enterprise Platform";
	let title = siteName;
	let description = "uCubers 엔터프라이즈 플랫폼의 커뮤니티 게시판";
	let keywords = "uCubers, 게시판, 커뮤니티, 엔터프라이즈";

	// 메뉴별 메타데이터 생성
	if (mainMenu === "community" && subMenu === "board") {
		// 게시판 관련 메타데이터
		const allBoards = [
			...(boardMenus.cpBoards || []),
			...(boardMenus.psBoards || []),
		];
		const currentBoard = allBoards.find(
			(board) => board.menuId === sideMain
		);

		if (leafMenu === "post-view" && sideMain) {
			title = `게시글 #${sideMain} - ${siteName}`;
			description = `${siteName}의 게시글을 확인하세요.`;
			keywords += ", 게시글, 상세보기";
		} else if (currentBoard) {
			title = `${
				currentBoard.menuNm || currentBoard.menuId
			} - ${siteName}`;
			description = `${
				currentBoard.menuNm || currentBoard.menuId
			} 게시판의 글들을 확인하세요.`;
			keywords += `, ${currentBoard.menuNm || currentBoard.menuId}`;
		} else if (leafMenu === "board" || leafMenu === "list") {
			title = `게시판 목록 - ${siteName}`;
			description =
				"다양한 주제의 게시판에서 정보를 공유하고 소통하세요.";
			keywords += ", 목록, 게시판 목록";
		} else if (leafMenu === "write") {
			title = `글쓰기 - ${siteName}`;
			description = "새로운 글을 작성하여 커뮤니티와 정보를 공유하세요.";
			keywords += ", 글쓰기, 작성";
		} else if (leafMenu === "edit") {
			title = `글 수정 - ${siteName}`;
			description = "작성한 글을 수정하여 더 나은 내용으로 개선하세요.";
			keywords += ", 수정, 편집";
		}
	}

	return {
		title,
		description,
		keywords,
		type: "website",
		url: typeof window !== "undefined" ? window.location.href : "",
	};
}

function updateMetaTags(meta: MetaData) {
	// 기존 동적 메타 태그 제거
	const existingMeta = document.querySelectorAll("meta[data-dynamic]");
	existingMeta.forEach((tag) => tag.remove());

	// 새로운 메타 태그 추가
	const metaTags = [
		{name: "description", content: meta.description},
		{name: "keywords", content: meta.keywords || ""},
		{property: "og:title", content: meta.title},
		{property: "og:description", content: meta.description},
		{property: "og:type", content: meta.type || "website"},
		{property: "og:url", content: meta.url || ""},
		{name: "twitter:card", content: "summary_large_image"},
		{name: "twitter:title", content: meta.title},
		{name: "twitter:description", content: meta.description},
	];

	metaTags.forEach(({name, property, content}) => {
		if (content) {
			const metaElement = document.createElement("meta");
			if (name) metaElement.setAttribute("name", name);
			if (property) metaElement.setAttribute("property", property);
			metaElement.setAttribute("content", content);
			metaElement.setAttribute("data-dynamic", "true");
			document.head.appendChild(metaElement);
		}
	});
}

export default useDynamicMeta;
