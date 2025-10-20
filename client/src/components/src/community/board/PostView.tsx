"use client";
import styles from "./styles/PostView.module.scss";
import {useEffect, useState} from "react";
import {useParams, usePathname, useRouter} from "next/navigation";
import parse from "html-react-parser";

import {useUserContext} from "@/context/UserContext";
import {useBoardContext} from "@/context/BoardContext";
import {PostType} from "@/components/src/community/board/etc/board.type";

import {requestPost} from "@/util/api/api-service";
import {LocalStorage} from "@/util/common/storage";
import {GATEWAY_URL} from "@/util/common/config";
import {isNotEmpty} from "@/util/validators/check-empty";
import {copyCurrentUrlToClipboard} from "@/util/helpers/copy-text";
import {dateTimeWithPeriod} from "@/util/helpers/formatters";

import Divider from "@/components/common/segment/Divider";

import {FiCopy, FiPrinter, FiEdit, FiDelete} from "react-icons/fi";
import {FaRegUserCircle} from "react-icons/fa";
import {GoComment, GoBookmark, GoBookmarkFill} from "react-icons/go";
import clsx from "clsx";
import AlertService from "@/services/alert.service";
import Comment from "./Comment";
import IconNode from "@/components/common/segment/IconNode";

type FileType = {
  fileIdx: number;
  fileName: string;
  filePath: string;
  fileSize: string;
  fileType: string;
};

export default function PostView() {
  const {matchUserIdToRank} = useUserContext();
  const {postState, postDispatch} = useBoardContext();
  const {post} = postState;
  const userId = LocalStorage.getUserId();
  const {title, content, commentCount, scrapCount, viewCount} = post;

  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu, leafMenu, sideMain] = pathSegs;
  const router = useRouter();

  const postIdx = parseInt(sideMain);
  // const [previewFile, setPreviewFile] = useState<FileType | null>(null);
  const [files, setFiles] = useState<FileType[]>();

  function onClickEdit() {
    postDispatch({type: "SET_MODE", payload: "edit"});
    const urlLeaf = "add-post";
    router.push(`/${mainMenu}/${subMenu}/${urlLeaf}`);
  }

  async function onDelete() {
    const res = await requestPost("/board/deletePost", {
      postIdx: postIdx,
    });
    if (res.statusCode === 200) {
      const url = `/${mainMenu}/${subMenu}`;
      router.push(url);
      AlertService.success("게시물이 삭제되었습니다");
      postDispatch({type: "RESET"});
    }
  }

  function onClickBoard() {
    router.push(`/${mainMenu}/${subMenu}`);
  }

  // 온클릭댓글로 탈바꿈하기
  // function onClickRespond() {
  // const url = `/${mainMenu}/${subMenu}/${UrlEnum.RESPOND}/${pollIdx}`;
  // 	router.push(url);
  // }

  useEffect(() => {
    if (isNotEmpty(postIdx)) {
      Promise.all([getPostDetail(), updateViewCount()]);
    }
  }, [postIdx]);

  async function getPostDetail() {
    const res = await requestPost("/board/getPostWithCounts", {
      postIdx: postIdx,
      scrapCount: scrapCount,
      commentCount: commentCount,
      viewCount: viewCount,
    });
    if (res.statusCode === 200) {
      postDispatch({type: "SET_POST", payload: res.data}); // 결과테스트
    }
  }

  async function updateViewCount() {
    await requestPost("/board/updateViewCount", {
      postIdx: postIdx,
    });
  }

  // 첨부파일 불러오기
  useEffect(() => {
    const idxStrArr = post?.fileIdxes?.split(",");
    if (idxStrArr) {
      const idxNumArr = idxStrArr.map((num) => Number(num));
      getFiles(idxNumArr);
      console.log(post);
    }
}, [post?.fileIdxes]);

  async function getFiles(idxNumArr: number[]) {
    const res = await requestPost("/file/getFiles", {
      fileIdxes: idxNumArr,
      moduleNm: "board",
    });
    setFiles(res);
  }

  function onClickCopyUrl() {
    const success = () => AlertService.success("URL이 복사되었습니다.");
    const error = () => AlertService.error("URL 복사에 실패하였습니다.");
    copyCurrentUrlToClipboard(success, error);
  }

  function onClickPrint() {
    window.print();
  }

  async function checkIsScrapped() {
    const param = {
      postIdx: postIdx,
    };
    const currentScrap = post?.scrap;
    const url = `/board/${currentScrap ? "deleteScrap" : "registerScrap"}`;

    try {
      const res = await requestPost(url, param);
      if (res.statusCode === 200) {
        postDispatch({
          type: "UPDATE_POST_FIELD",
          payload: {name: "scrap", value: !post?.scrap},
        });
      }
    } catch (res) {
      console.log(res);
    }
  }

  // const {openModal, closeModal, modalConfig} = useModal();

  // function onClickPreview(e: React.MouseEvent<HTMLElement>, file: FileType) {
  // 	e.stopPropagation();
  // 	setPreviewFile(file);
  // 	openModal();
  // }

  // const renderPreview = () => {
  // 	if (!previewFile) return null;

  // 	const ext = previewFile.fileName.split(".").pop()?.toLowerCase();
  // 	const realName = previewFile.filePath.split("/").pop()!;

  // 	if (ext === "pdf") return <PdfPreview fileName={realName} />;
  // 	if (["xls", "xlsx"].includes(ext || "뿡"))
  // 		return <ExcelPreview fileName={realName} />;
  // 	if (["ppt", "pptx"].includes(ext || "뿡"))
  // 		return <PptPreview fileName={realName} />;
  // 	return <p>미리보기를 지원하지 않는 확장자입니다. 😢</p>;
  // };
  return (
    <div className={clsx(styles.wrapper)}>
      <h1 className={styles.title}>{post?.title}</h1>
      <div className={styles.meta}>
        <div className={styles.writerInfo}>
          <div className={styles.leftGroup}>
            <FaRegUserCircle className={styles.avatar} />
            <span className={styles.writer}>
              {matchUserIdToRank(post?.creatorId || "")}
            </span>
            <span className={styles.date}>
              {post?.createdAt
                ? dateTimeWithPeriod(post?.createdAt)
                : undefined}
            </span>
          </div>
        </div>
        <div className={styles.rightGroup}>
          <span>
            {commentCount ? (
              <span className={styles.iconRow}>
                <IconNode iconName="goComment" size={14} color="gray5" />{" "}
                {commentCount}
              </span>
            ) : (
              <span className={styles.iconRow}>
                <IconNode iconName="goComment" size={14} color="gray5" /> 0
              </span>
            )}
          </span>
          <span>
            {scrapCount ? (
              <span className={styles.iconRow}>
                <IconNode iconName="goBookmark" size={14} color="gray5" />{" "}
                {scrapCount}
              </span>
            ) : (
              <span className={styles.iconRow}>
                <IconNode iconName="goBookmark" size={14} color="gray5" /> 0
              </span>
            )}
          </span>
          <span>
            {viewCount ? (
              <span className={styles.iconRow}>
                <IconNode iconName="ioEyeOutline" size={14} color="gray5" />{" "}
                {viewCount}
              </span>
            ) : (
              <span className={styles.iconRow}>
                <IconNode iconName="ioEyeOutline" size={14} color="gray5" /> 0
              </span>
            )}
          </span>

          {/* <div className={styles.iconGroup}>
					<span>
						<GoComment /> {post?.commentCount}
					</span>
					<span>
						<GoBookmark /> 스크랩수
					</span>
					<span>
						<IoEyeOutline /> {post?.viewCount}
					</span>
				</div> */}
        </div>
      </div>
      <Divider />
      <div className={styles.content}>{parse(post.content ?? "")}</div>
      <div className={styles.attachments}>
        {files &&
          files.map((file, idx) => {
            const fileName = `${file.fileName}`; // 사용자에게 보여줄 파일명
            const fileRealName = file.filePath.split("/").pop() || fileName; // 실제 폴더에 저장되는 파일명

            const previewUrl = `${GATEWAY_URL}/file/preview/${fileRealName}?moduleNm=board`;
            const downloadUrl = `${previewUrl}&download=true`;
            // 다운로드는 잘 됨, 미리보기는 안되는 상황

            return (
              <div className={styles.file} key={idx}>
                <IconNode iconName="attachment" size={12} />
                <a
                  download
                  target="_blank"
                  href={downloadUrl}
                  rel="noopener noreferrer"
                >
                  <span>{fileName}</span>
                </a>
                <span className={styles.fileSize}>{file.fileSize}</span>

                {/* <Button
									componentType="smallGray"
									onClick={(
										e: React.MouseEvent<HTMLElement>
									) => onClickPreview(e, file)}
								>
									미리보기
								</Button> */}
              </div>
            );
          })}
      </div>
      {/* <Modal closeModal={closeModal} modalConfig={modalConfig}>
				{renderPreview()}
			</Modal> */}
      <Divider type="none" />
      <div className={styles.footerActions}>
        <div className={styles.buttonGroup}>
          <span role="button">
            {post?.scrap ? (
              <span onClick={checkIsScrapped}>
                <IconNode iconName="goBookmarkFill" size={14} color="gray5" />
                스크랩
              </span>
            ) : (
              <span onClick={checkIsScrapped}>
                <IconNode iconName="goBookmark" size={14} color="gray5" />
                스크랩
              </span>
            )}
          </span>
        </div>

        <div className={styles.buttonGroup}>
          <span role="button" onClick={onClickCopyUrl}>
            <IconNode iconName="fiCopy" size={14} color="gray5" /> URL 복사
          </span>
          <span role="button" onClick={onClickPrint}>
            <IconNode iconName="fiPrinter" size={14} color="gray5" /> 인쇄
          </span>

          {post?.creatorId === userId ? (
            <>
              <span role="button" onClick={onClickEdit}>
                <IconNode iconName="fiEdit" size={14} color="gray5" /> 수정
              </span>
              <span role="button" onClick={onDelete}>
                <IconNode iconName="fiDelete" size={14} color="gray5" /> 삭제
              </span>
            </>
          ) : null}
        </div>
      </div>
      <Divider type="middle" />
      <Comment postIdx={postIdx} />
      <Divider type="middle" />
      <button className={styles.listButton} onClick={onClickBoard}>
        목록
      </button>
    </div>
  );
}
