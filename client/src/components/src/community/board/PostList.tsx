"use client";
import styles from "./styles/BoardList.module.scss";
import {useEffect, useRef, useState} from "react";
import {useParams, usePathname, useRouter} from "next/navigation";

import {requestPost} from "@/util/api/api-service";
import {stripHtmlTags} from "@/util/helpers/formatters";
import useModal from "@/hooks/useModal";

import Pagination from "@/components/common/layout/Pagination";
import PostView from "./PostView";

import {useUserContext} from "@/context/UserContext";
import {useBoardContext} from "@/context/BoardContext";
import {PostType} from "@/components/src/community/board/etc/board.type";

import {RiPushpinLine} from "react-icons/ri";
import ListContentCard from "./ListContentCard";

export default function PostList({
  menuNodeMap,
}: {
  menuNodeMap: Record<string, () => any>;
}) {
  // 게시물 데이터 불러오기
  const {paginatedList, setPaginatedList, postState, postDispatch} =
    useBoardContext();
  const {matchUserIdToRank} = useUserContext();
  const {results, totalPage} = paginatedList;

  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu, leafMenu, sideMain, sideSub] = pathSegs;
  const router = useRouter();
  const idxRef = useRef(null);

  useEffect(() => {
    if (sideMain) getPaginatedPosts(sideMain);
  }, [sideMain]);

  // 페이지네이션 처리
  const [currentPage, setCurrentPage] = useState(1);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  async function getPaginatedPosts(menuId: string) {
    const buildParam = menuNodeMap[menuId];
    const option = buildParam ? buildParam() : null;

    const res = await requestPost("/board/getPaginatedPosts", {option});
    if (res.statusCode === 200) {
      console.log("응답 성공 데이터:", res.data);
      setPaginatedList(res.data);
    }
  }

  function onClickTitle(postIdx: number, menuId?: string) {
    postDispatch({
      type: "SET_MODE",
      payload: "view",
    });
    postDispatch({type: "SET_SELECTED", payload: postIdx});
    const guideUrl = "post-view";
    const url = `/${mainMenu}/${subMenu}/${guideUrl}/${postIdx}`;
    router.push(url);
  }

  useEffect(() => {
    console.log(postState);
  }, [postState]);

  return (
    <>
      {/* <div className={styles.wrapper}> */}
      {/* <div className={styles.orderAndSearch}>
				<div className={styles.selectBox}>
					<SelectBox
						codeClass="list-order"
						componentType="secondary"
						defaultLabel="최신순"
					></SelectBox>
				</div>
				<div className={styles.searchBox}>
					<InputSearch componentType="inList" />
				</div>
			</div> */}
      {results.map((post: PostType) => {
        const content = stripHtmlTags(post?.content || "");
        return (
            <ListContentCard
              title={post?.title}
              creator={matchUserIdToRank(post?.creatorId || "")}
              isNotice={post?.isNotice}
              createdAt={post?.createdAt}
              explanation={content}
              onClickTitle={() => onClickTitle(post.postIdx || 0, post.menuId)}
              key={post?.postIdx}
              viewCount={post?.viewCount || 0}
              commentCount={post?.commentCount || 0}
              scrapCount={post?.scrapCount || 0}
            />
        );
      })}
      {/* <div className={styles.list}>
				<List<
					PostType,
					{postIdx: number; menuId: string; isNotice: boolean}
				>
					listItems={paginatedPostList?.results}
					onClickTitle={({postIdx, menuId, isNotice}) =>
						onClickTitle(postIdx, menuId, isNotice)
					}
					renderRow={(item, onClickTitle) => (
						<>
							<span
								className={`${styles.boardItem} ${
									item.isNotice ? styles.notice : ""
								}`}
							>
								{item.isNotice ? (
									<RiPushpinLine></RiPushpinLine>
								) : (
									item.postIdx
								)}
							</span>
							<span
								className={`${styles.boardItem} ${
									item.isNotice ? styles.notice : ""
								}`}
							>
								{matchMenuCode(item.menuId || "")}
							</span>
							<span
								className={`${styles.postTitle} ${
									item.isNotice ? styles.notice : ""
								}`}
								onClick={() =>
									onClickTitle?.({
										postIdx: item.postIdx ?? 0,
										menuId: item.menuId ?? "",
										isNotice: !!item.isNotice,
									})
								}
							>
								{item.prefixId
									? `[${matchPrefixData(item.prefixId)}] `
									: ""}

								{item.postTitle}
							</span>
							<span
								className={`${
									item.isNotice ? styles.notice : ""
								}`}
							>
								{matchUserIdToRank(item.creatorId || "")}
							</span>
							<span
								className={`${
									item.isNotice ? styles.notice : ""
								}`}
							>
								{item.createdAt
									? dateWithPeriod(new Date(item.createdAt))
									: "N/A"}
							</span>
						</>
					)}
				/>
			</div> */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPage}
        onPageChange={paginate}
      ></Pagination>
      {/* <div /> */}
    </>
  );
}
