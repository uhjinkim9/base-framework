"use client";
import React from "react";
import styles from "./styles/IconNode.module.scss";
import clsx from "clsx";
/**
 * IconNode 컴포넌트
 * @description 다양한 아이콘을 이름 기반으로 렌더링하는 범용 컴포넌트
 * 							아이콘 종류는 iconMap에서 관리하며, 크기/색상 커스텀 가능
 * @author 김어진
 * @updated 2025-09-16
 */
import {
  LuTextCursorInput,
  LuClock,
  LuUser,
  LuX,
  LuAlignJustify,
  LuSettings,
  LuSearch,
  LuStar,
  LuMail,
  LuMailOpen,
  LuPaperclip,
  LuShare,
  LuShare2,
  LuPrinter,
  LuChevronLeft,
  LuChevronRight,
  LuChevronUp,
  LuChevronDown,
  LuInfo,
  LuCircleArrowUp,
  LuCirclePlus,
  LuPencil,
  LuCheck,
  LuTrash,
} from "react-icons/lu";
import {CiSearch} from "react-icons/ci";
import {
  TbAdjustmentsHorizontal,
  TbExclamationCircleFilled,
  TbExclamationMark,
  TbRefresh,
  TbSortAscending,
  TbSortDescending,
} from "react-icons/tb";
import {GoBookmark, GoBookmarkFill, GoComment} from "react-icons/go";
import {IoEyeOutline} from "react-icons/io5";
import {FiCopy, FiDelete, FiEdit, FiPrinter} from "react-icons/fi";
/**
 * 새 아이콘 추가 시 이 객체에 등록
 * @see https://react-icons.github.io/react-icons/icons/lu/ (가장 많이 사용)
 * @see https://react-icons.github.io/react-icons/icons/tb/ (다음으로 많이 사용)
 * @see https://react-icons.github.io/react-icons/icons/ci/ (그냥 얇아서 예쁨)
 */
const iconMap: Record<string, React.ReactNode> = {
  cross: <LuX />,
  textCursor: <LuTextCursorInput />,
  clock: <LuClock />,
  user: <LuUser />,
  dragHandle: <LuAlignJustify />,
  setting: <LuSettings />,
  search: <LuSearch />,
  searchThin: <CiSearch />,
  refresh: <TbRefresh />,
  tuning: <TbAdjustmentsHorizontal />,
  sortAsc: <TbSortAscending />,
  sortDesc: <TbSortDescending />,
  star: <LuStar />,
  mail: <LuMail />,
  mailOpen: <LuMailOpen />,
  attachment: <LuPaperclip />,
  export: <LuShare />,
  share: <LuShare2 />,
  print: <LuPrinter />,
  chevronLeft: <LuChevronLeft />,
  chevronRight: <LuChevronRight />,
  chevronUp: <LuChevronUp />,
  chevronDown: <LuChevronDown />,
  circleUp: <LuCircleArrowUp />,
  info: <LuInfo />,
  circlePlus: <LuCirclePlus />,
  exclamation: <TbExclamationMark />,
  circleExclamation: <TbExclamationCircleFilled />,
  pencil: <LuPencil />,
  check: <LuCheck />,
  trash: <LuTrash />,
  goComment: <GoComment />,
  ioEyeOutline: <IoEyeOutline />,
  goBookmark: <GoBookmark />,
  goBookmarkFill: <GoBookmarkFill />,
  fiCopy: <FiCopy />,
  fiPrinter: <FiPrinter />,
  fiEdit: <FiEdit />,
  fiDelete: <FiDelete />,
};

type IconNodeProps = {
  iconName: keyof typeof iconMap;
  size?: number;
  color?: string;
  filled?: boolean;
  circleBorder?: boolean;
  onHoverOpaque?: boolean;
  cursorPointer?: boolean;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  padding?: string;
};

export default function IconNode({
  iconName,
  size = 20,
  color = "",
  filled = false,
  circleBorder = false,
  onHoverOpaque = false,
  cursorPointer = false,
  onClick,
  padding,
}: IconNodeProps) {
  const iconPath = iconMap[iconName];

  if (!iconPath) {
    // iconMap에 없는 아이콘 이름이 들어오면 경고 출력 후 렌더링하지 않음
    console.warn(`Icon "${iconName}" not found in iconMap`);
    return null;
  }

  // filled가 true일 때 아이콘에 fill 속성을 직접 전달
  const iconWithFill = filled
    ? React.cloneElement(
        iconPath as React.ReactElement,
        {
          fill: "currentColor",
        } as any,
      )
    : iconPath;

  return (
    <span
      className={clsx(
        styles.icon,
        styles[color],
        onHoverOpaque ? styles.onHoverOpaque : "",
        circleBorder ? styles.circleBorder : "",
        cursorPointer ? styles.pointer : "",
      )}
      style={{fontSize: size, padding: padding}}
      onClick={onClick}
    >
      {iconWithFill}
    </span>
  );
}

/**
 * IconName
 * @description 사용 가능한 아이콘 이름 타입. iconMap의 key와 동일.
 */
export type IconName = keyof typeof iconMap;
