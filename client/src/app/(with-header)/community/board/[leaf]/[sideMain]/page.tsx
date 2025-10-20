"use client";
import {useParams} from "next/navigation";
import {useBoardContext} from "@/context/BoardContext";

import PostList from "@/components/src/community/board/PostList";
import PostView from "@/components/src/community/board/PostView";

// 게시글 보기 또는 게시판 목록
export default function PostViewPage() {
  const params = useParams() as { leaf: string; sideMain: string };
  const { leaf, sideMain } = params;

  const { boardMenus } = useBoardContext();
  const boards = [...(boardMenus.cpBoards || []), ...(boardMenus.psBoards || [])];

  const menuNodeMap = boards.reduce<Record<string, () => any>>((acc, bm) => {
    acc[bm.menuId] = () => ({ menuId: bm.menuId });
    return acc;
  }, {});

  // 1) 게시글 상세: /community/board/post-view/:postIdx
  if (leaf === "post-view") {
    return <PostView />;
  }

  // 2) 게시판 목록: /community/board/:leaf/:menuId → sideMain이 메뉴ID
  if (Object.prototype.hasOwnProperty.call(menuNodeMap, sideMain)) {
    return <PostList menuNodeMap={menuNodeMap} />;
  }

  // 3) 기타: 아무것도 매칭되지 않으면 안전하게 빈 요소 반환
  return <></>;
}

