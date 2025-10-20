"use client";
import styles from "./styles/PostViewBrief.module.scss";
import parse from "html-react-parser";
import clsx from "clsx";
import AlertService from "@/services/alert.service";
import Divider from "@/components/common/segment/Divider";
import Comment from "../../community/board/Comment";

import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useUserContext} from "@/context/UserContext";
import {requestPost} from "@/util/api/api-service";
import {LocalStorage} from "@/util/common/storage";
import {GATEWAY_URL} from "@/util/common/config";
import {isNotEmpty} from "@/util/validators/check-empty";
import {copyCurrentUrlToClipboard} from "@/util/helpers/copy-text";
import {dateTimeWithPeriod} from "@/util/helpers/formatters";
import {FiCopy, FiPrinter, FiEdit, FiDelete} from "react-icons/fi";
import {FaRegUserCircle} from "react-icons/fa";
import {GrAttachment} from "react-icons/gr";
import {GoBookmark} from "react-icons/go";
import {PostType} from "../../community/board/etc/board.type";

type FileType = {
  fileIdx: number;
  fileName: string;
  filePath: string;
  fileSize: string;
  fileType: string;
};

export default function PostViewBrief({postIdx}: {postIdx: number}) {
  const {matchUserIdToRank} = useUserContext();
  const [post, setPost] = useState<PostType | null>(null);
  const userId = LocalStorage.getUserId();

  const pathname = usePathname();
  const [_, mainMenu, subMenu] = pathname.split("/"); // mainMenu: community
  const router = useRouter();

  const [files, setFiles] = useState<FileType[]>();

  useEffect(() => {
    getPost();
  }, [postIdx]);

  async function getPost() {
    const res = await requestPost("/board/getPostWithCounts", {
      postIdx: postIdx,
    });
    if (res.statusCode === 200) {
      setPost(res.data);
      console.log(res.data);
    }
  }

  function onClickEdit() {
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
      setPost(null);
    }
  }

  // userId, postIdx 모두 있을 때 조회 수 업데이트
  useEffect(() => {
    if (isNotEmpty(userId) && postIdx) {
      updateViewCount(userId as string);
    }
  }, [userId, postIdx]);

  async function updateViewCount(userId: string) {
    await requestPost("/board/updateViewCount", {
      postIdx: postIdx,
      viewerId: userId,
    });
  }

  // 첨부파일 불러오기
  // useEffect(() => {
  // 	const idxStrArr = post?.fileIdxes?.split(",");
  // 	if (idxStrArr) {
  // 		const idxNumArr = idxStrArr.map((num) => Number(num));
  // 		getFiles(idxNumArr);
  // 		console.log(post);
  // 	}
  // }, [post?.fileIdxes]);

  // async function getFiles(idxNumArr: number[]) {
  // 	const res = await requestPost("/file/getFiles", {
  // 		fileIdxes: idxNumArr,
  // 	});
  // 	setFiles(res);
  // }
  ///--------------TODO----------------
  /// 첨부파일 미리보기 기능 추가 필요
  ///------------------------------

  function onClickCopyUrl() {
    const success = () => AlertService.success("URL이 복사되었습니다.");
    const error = () => AlertService.error("URL 복사에 실패하였습니다.");
    copyCurrentUrlToClipboard(success, error);
  }

  function onClickPrint() {
    window.print();
  }

  return (
    <div className={clsx(styles.wrapper)}>
      <h1 className={styles.mainText}>{post?.title}</h1>
      <div className={styles.meta}>
        <div className={styles.writerInfo}>
          <FaRegUserCircle className={styles.avatar} />
          <span className={styles.writer}>
            {matchUserIdToRank(post?.creatorId || "")}
          </span>
          <span className={styles.date}>
            {post?.createdAt ? dateTimeWithPeriod(post?.createdAt) : undefined}
          </span>
        </div>

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
      <Divider />
      <div className={styles.content}>{parse(post?.content ?? "")}</div>
      <div className={styles.attachments}>
        {files &&
          files.map((file, idx) => {
            const fileName = `${file.fileName}`; // 사용자에게 보여줄 파일명
            const fileRealName = file.filePath.split("/").pop() || fileName; // 실제 폴더에 저장되는 파일명

            // 요건 지우면안됨 헷갈리지말기
            const previewUrl = `${GATEWAY_URL}/board/preview/${fileRealName}`;
            const downloadUrl = `${previewUrl}?download=true`;

            return (
              <div className={styles.file} key={idx}>
                <GrAttachment />
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
            <GoBookmark className={styles.icon} /> 스크랩
          </span>
        </div>

        <div className={styles.buttonGroup}>
          <span role="button" onClick={onClickCopyUrl}>
            <FiCopy className={styles.icon} /> URL 복사
          </span>
          <span role="button" onClick={onClickPrint}>
            <FiPrinter className={styles.icon} /> 인쇄
          </span>

          {post?.creatorId === userId ? (
            <>
              <span role="button" onClick={onClickEdit}>
                <FiEdit className={styles.icon} /> 수정
              </span>
              <span role="button" onClick={onDelete}>
                <FiDelete className={styles.icon} /> 삭제
              </span>
            </>
          ) : null}
        </div>
      </div>
      <Divider type="middle" />
      <Comment postIdx={postIdx} userId={userId} />
    </div>
  );
}
