"use client";
import styles from "./styles/AddPost.module.scss";
import clsx from "clsx";

import {ChangeEvent, useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {motion} from "framer-motion";

import {useBoardContext} from "@/context/BoardContext";
import {PostType} from "@/components/src/community/board/etc/board.type";
import {validatePost} from "./etc/validate";
import {requestPost} from "@/util/api/api-service";
import {isNotEmpty} from "@/util/validators/check-empty";

import AlertService from "@/services/alert.service";

import FileDrop from "@/components/common/editor/parts/FileDrop";
import TextEditor from "@/components/common/editor/TextEditor";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import Divider from "@/components/common/segment/Divider";
import DateRangePicker from "@/components/common/form-properties/DateRangePicker";
import DateTimePicker from "@/components/common/form-properties/DateTimePicker";
import SelectBox from "@/components/common/form-properties/SelectBox";
import Toggle from "@/components/common/form-properties/Toggle";
import InputBasic from "@/components/common/form-properties/InputBasic";

export default function AddPost() {
  const {postState, postDispatch, boardMenus} = useBoardContext();
  const {mode, selected, post} = postState;
  const [fileIndexes, setFileIndexes] = useState<number[]>([]);

  const boards = [...boardMenus.cpBoards, ...boardMenus.psBoards];
  const selectableBoards = boards
    .filter((b) => !b.menuId.includes("all") && !b.menuId.includes("mine") && !b.menuId.includes("temp"))
    .map((b) => ({label: b.menuNm, value: b.menuId}));

  const router = useRouter();
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu] = pathSegs; // mainMenu: community

  async function getPostDetail() {
    const res = await requestPost("/post/getPostDetail", {
      postIdx: selected,
    });
    if (res.statusCode === 200) {
      postDispatch({type: "SET_POST", payload: res.data});
    }
  }

  useEffect(() => {
    if (mode === "edit") getPostDetail();
  }, [selected]);

  function onChangePost(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const {name, value} = e.target;
    postDispatch({
      type: "UPDATE_POST_FIELD",
      payload: {
        name: name as keyof PostType,
        value: value,
      },
    });
  }

  async function createOrUpdatePost(isTemp: boolean = false) {
    const validationCheck = validatePost(post);
    if (!validationCheck) return;

    let fileIdxStr = "";
    fileIdxStr = fileIndexes.map((idx) => `${idx}`).join(",");
    if (isNotEmpty(post?.fileIdxes)) {
      fileIdxStr = `${post?.fileIdxes},${fileIdxStr}`;
    } else {
      fileIdxStr = fileIndexes.map((idx) => `${idx}`).join(",");
    }

    const res = await requestPost("/board/createOrUpdatePost", {
      ...post,
      fileIdxes: fileIdxStr,
    });
    if (res.statusCode === 200) {
      AlertService.success("게시물이 등록되었습니다.");

      const url = `/${mainMenu}/${subMenu}`;
      router.push(url);
      postDispatch({type: "RESET"});
    }
  }

  async function onCancel() {
    router.push("./");
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.col}>
          <SelectBox
            onChange={onChangePost}
            componentType="smallGray"
            customOptions={selectableBoards}
            name="menuId"
            value={post?.menuId}
          />
          {/* 말머리 사용 O라면 말머리 선택하는 셀렉박스 넣기 */}
        </div>
        <InputBasic
          name="title"
          value={post?.title ?? ""}
          placeholder="제목 입력"
          onChange={onChangePost}
          width="99%"
          noPadding
        />
      </div>
      <div className={styles.settings}>
        <Toggle
          label="상단 고정"
          name="isNotice"
          value={post?.isNotice}
          onChange={onChangePost}
        />
        <Toggle
          label="예약"
          name="isScheduled"
          value={post?.isScheduled}
          onChange={onChangePost}
        />
      </div>
      <motion.div
        className={clsx(styles.row, styles.datePicker)}
        initial={false}
        animate={{
          height: post?.isNotice ? "auto" : 0,
          opacity: post?.isNotice ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        style={{overflow: "hidden"}}
      >
        <span className={styles.refText}>상단 고정 기간</span>
        <DateRangePicker
          startedAt={post?.noticeStartedAt}
          endedAt={post?.noticeEndedAt}
          startName="noticeStartedAt"
          endName="noticeEndedAt"
          onChange={onChangePost}
        />
      </motion.div>
      <motion.div
        className={clsx(styles.row, styles.datePicker)}
        initial={false}
        animate={{
          height: post?.isScheduled ? "auto" : 0,
          opacity: post?.isScheduled ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        style={{overflow: "hidden"}}
      >
        <span className={styles.refText}>업로드 예약일</span>
        <DateTimePicker
          initDate={post?.scheduledAt}
          initDateNm="scheduledAt"
          onChange={onChangePost}
        />
      </motion.div>

      <TextEditor
        name="content"
        value={post?.content}
        onChange={onChangePost}
        etc={{mode: mode}}
      />
      <FileDrop
        setFileIndexes={setFileIndexes}
        fileIdxes={post?.fileIdxes}
        moduleNm="board"
      />
      <Divider type="none" />

      <CommonButtonGroup
        usedButtons={{
          btnSubmit: true,
          btnCancel: true,
          btnTempSave: true,
        }}
        onSubmit={createOrUpdatePost}
        onCancel={onCancel}
      ></CommonButtonGroup>
    </div>
  );
}
