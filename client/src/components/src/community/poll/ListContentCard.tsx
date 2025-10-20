"use client";
import styles from "./styles/ListContentCard.module.scss";
import dayjs from "dayjs";
import clsx from "clsx";
import {useEffect, useState} from "react";

import ProfileImage from "@/components/common/segment/ProfileImage";
import Divider from "@/components/common/segment/Divider";

import {dateTimeWithPeriod, fullDateWithLabel} from "@/util/helpers/formatters";
import {requestPost} from "@/util/api/api-service";
import {HiOutlineSpeakerWave} from "react-icons/hi2";
import {GoClock} from "react-icons/go";

type PrefixType = "poll" | "docs" | "null";
type StatusColor = "red" | "blue" | "gray" | "green" | "yellow";

interface StatusBoxItem {
  idx: number;
  text: string;
  color: StatusColor;
}

export default function ListContentCard({
  isResponded,
  title,
  explanation,
  startedAt,
  endedAt,
  isNotice,
  creator,
  createdAt,
  onClickTitle,
  renderingPrefix = "null",
  statusBox,
  postIdx,
}: {
  isResponded?: any;
  title?: string;
  explanation?: string;
  startedAt?: string;
  endedAt?: string;
  isNotice?: boolean;
  creator?: string;
  createdAt?: Date;
  onClickTitle?: () => void;
  renderingPrefix?: PrefixType;
  statusBox?: StatusBoxItem[];
  postIdx?: number;
}) {
  const formattedStart = fullDateWithLabel(startedAt ?? ""); // kst
  const formattedEnd = fullDateWithLabel(endedAt ?? "");
  const currentTime = dayjs().toISOString(); // 현재 시각

  // 색상별 스타일 클래스 매핑
  const getStatusColorClass = (color: StatusColor): string => {
    const colorMap: Record<StatusColor, string> = {
      red: styles.statusRed,
      blue: styles.statusBlue,
      gray: styles.statusGray,
      green: styles.statusGreen,
      yellow: styles.statusOrange,
    };
    return colorMap[color] || styles.statusGray;
  };

  // statusBox가 있으면 우선 사용, 없으면 기존 방식 사용
  const renderStatusBoxes = () => {
    if (statusBox && statusBox.length > 0) {
      return statusBox.map((item) => (
        <div key={item.idx} className={getStatusColorClass(item.color)}>
          <span>{item.text}</span>
        </div>
      ));
    }

    // 기존 prefixMap 방식 (하위 호환성 유지)
    return prefixMap[renderingPrefix];
  };

  // 요거 내용물 상위컴포넌트(폴 리스트)로 옮기기
  const prefixMap: Record<PrefixType, React.ReactNode> = {
    poll: (
      <>
        {startedAt && endedAt && currentTime < endedAt ? (
          <div className={styles.inProgress}>
            <span>진행중</span>
          </div>
        ) : (
          <div className={styles.finished}>
            <span>완료</span>
          </div>
        )}
        <div className={isResponded ? styles.responded : styles.notResponded}>
          <span>{isResponded ? "참여" : "미참여"}</span>
        </div>
      </>
    ),
    docs: (
      <>
        <div className={clsx(styles.notResponded)}>
          <span>대기</span>
        </div>
        <div className={clsx(styles.finished)}>
          <span>완료</span>
        </div>
      </>
    ),
    null: null,
  };

  const [postIndex, setPostIndex] = useState<number>(0);

  useEffect(() => {
    if (postIndex) getPostWithCounts();
  }, [postIndex]);

  async function getPostWithCounts() {
    try {
      const res = await requestPost("/board/getPostWithCounts", {page: 1, postIdx: postIndex});
      if (res.statusCode === 200) {
        console.log("얄라리");
        console.log("응답 성공 데이터2:", res.data);
        setPostIndex(res.data);
      }
    } catch (err) {
      console.error("조회수 가져오기 실패:", err);
    }
  }

  return (
    <>
      <div className={clsx(styles.wrapper, isNotice && styles.notice)}>
        <div className={styles.status}>
          {renderStatusBoxes()}

          {isNotice && (
            <div className={isNotice ? styles.notice : ""}>
              <HiOutlineSpeakerWave className={styles.icon} />
            </div>
          )}

          <span onClick={onClickTitle} className={styles.title}>
            {title}
          </span>
        </div>

        {explanation ? (
          <span className={clsx(styles.subContentText, styles.explanation)}>
            {explanation}
          </span>
        ) : null}

        <div className={styles.creator}>
          <ProfileImage path="/ko-kil-dong.png" alt="profile" size="1.5rem" />

          <div className={styles.creator}>
            <div className={styles.col}>
              <div className={styles.row}>
                <span className={styles.name}>{creator ?? "(이름 없음)"}</span>
                <span className={styles.smallInfo}>
                  {createdAt ? dateTimeWithPeriod(createdAt) : "(작성일 없음)"}
                </span>
              </div>

              {startedAt && endedAt && (
                <span className={styles.smallInfo}>
                  <GoClock className={styles.icon} />
                  {formattedStart} ~ {formattedEnd}
                </span>
              )}
            </div>
            <span>
              {postIdx ? (
                <span>조회수 {postIndex}</span>
              ) : (
                <span>조회수 0</span>
              )}
            </span>
          </div>
        </div>
      </div>
      <Divider type="middle" />
    </>
  );
}
