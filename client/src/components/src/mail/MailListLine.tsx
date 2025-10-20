"use client";
import styles from "./styles/MailListLine.module.scss";
import clsx from "clsx";

import {dateWithHyphenAndTimeWithColon} from "@/util/helpers/formatters";
import IconNode from "@/components/common/segment/IconNode";
import CheckIconBox from "@/components/common/form-properties/CheckIconBox";
import CheckBox from "@/components/common/form-properties/CheckBox";

export default function MailListLine({
  title,
  creator,
  createdAt,
  onClickTitle,
  isImportant,
  isRead,
}: {
  title?: string;
  creator?: string;
  createdAt?: Date;
  onClickTitle?: () => void;
  isImportant?: boolean;
  isRead?: boolean;
}) {
  return (
    <>
      <div className={styles.lineWrapper}>
        <div className={clsx(styles.inRowGroup, styles.icons)}>
          <CheckBox componentType="orange" />
          <CheckIconBox componentType="star" value={isImportant} size={20} />
          {isRead ? (
            <IconNode iconName="mailOpen" color="gray4" />
          ) : (
            <IconNode iconName="mail" color="black" />
          )}
        </div>

        <span
          className={clsx(
            styles.name,
            isRead ? styles.subTextGray : styles.subText,
          )}
        >
          {creator ?? "(이름 없음)"}
        </span>

        <span
          onClick={onClickTitle}
          className={clsx(
            styles.title,
            isRead ? styles.subTextGray : styles.subText,
          )}
        >
          {title}
        </span>

        <span
          className={clsx(
            styles.date,
            isRead ? styles.subTextGray : styles.subText,
          )}
        >
          {createdAt
            ? dateWithHyphenAndTimeWithColon(createdAt)
            : "(작성일 없음)"}
        </span>
      </div>
    </>
  );
}
