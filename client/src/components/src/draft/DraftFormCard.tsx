"use client";
import styles from "./styles/DraftFormCard.module.scss";
import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

import { useUserContext } from "@/context/UserContext";
import { usePollContext } from "@/context/PollContext";
import { requestPost } from "@/util/api/api-service";
import { LocalStorage } from "@/util/common/storage";

import { ResponseStatus } from "@/components/src/poll/etc/poll.type";
import Divider from "@/components/common/segment/Divider";
import clsx from "clsx";
// import Pagination from "@/components/common/layout/Pagination";
// import ListContentCard from "./ListContentCard";

export default function DraftFormCard({
  id,
  title,
  group,
  memo,
  onClick,
}: {
  id: string;
  title: string;
  group: string;
  memo: string;
  onClick: (id: string) => void;
}) {
  const userId = LocalStorage.getUserId();
  const params = useParams();

  return (
    <div className={styles.labelWrapper}>
      <div
        className={clsx(styles.wrapper, styles.row)}
        onClick={() => onClick(id)}>
        <span className={styles.label}>{group ?? "기타"}</span>
        <span className={styles.title}>{title}</span>
        {memo ? <span className={clsx(styles.smallInfo)}>{memo}</span> : null}
      </div>
      <Divider type="middle" look="dotted" />
    </div>
  );
}
