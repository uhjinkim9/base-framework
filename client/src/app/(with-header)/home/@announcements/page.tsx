"use client";
import styles from "./page.module.scss";
import Link from "next/link";
import SubTitle from "@/components/common/segment/SubTitle";
import Card from "@/components/common/layout/Card";
import Modal from "@/components/common/layout/Modal";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import PostViewBrief from "@/components/src/home/announcement/PostViewBrief";

import {useEffect, useState} from "react";
import {LuInfo} from "react-icons/lu";
import {requestPost} from "@/util/api/api-service";
import {PostType} from "@/components/src/community/board/etc/board.type";
import {dateWithPeriod} from "@/util/helpers/formatters";
import {useUserContext} from "@/context/UserContext";
import useModal from "@/hooks/useModal";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<PostType[]>([]);
  const [postIdx, setPostIdx] = useState<number | null>(null);

  const {openModal, closeModal, modalConfig} = useModal();

  const {matchUserIdToRank} = useUserContext();

  const getPosts = async () => {
    const res = await requestPost("/board/getPaginatedPosts", {
      option: {
        menuId: "board-notice",
        isScheduled: 0,
        page: 1,
        limit: 5,
      },
    });
    if (res.statusCode === 200) {
      setAnnouncements(res.data.results);
    }
  };
  useEffect(() => {
    getPosts();
  }, []);

  function onClickTitle(postIdx: number) {
    setPostIdx(postIdx);
    openModal();
  }

  return (
    <>
      <Card>
        <div className={styles.wrapper}>
          <SubTitle icon={<LuInfo />}>
            <Link href={"/community/board/board-notice"}>공지</Link>
          </SubTitle>

          <ul className={styles.list}>
            {announcements.map((ann) => (
              <li key={ann.postIdx}>
                <div className={styles.creator}>
                  <span className={styles.name}>
                    {ann.creatorId && matchUserIdToRank(ann.creatorId)}
                  </span>
                </div>
                <span
                  className={styles.title}
                  onClick={() => onClickTitle(ann.postIdx || 0)}
                >
                  {ann.title}
                </span>

                <span className={styles.date}>
                  {ann.createdAt ? dateWithPeriod(ann.createdAt) : "N/A"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Modal
        modalConfig={modalConfig}
        closeModal={closeModal}
        modalTitle={"공지사항"}
        footerContent={
          <CommonButtonGroup
            usedButtons={{btnCancel: true}}
            cancelBtnLabel="닫기"
            onCancel={closeModal}
          />
        }
      >
        {postIdx !== null && <PostViewBrief postIdx={postIdx} />}
      </Modal>
    </>
  );
}
