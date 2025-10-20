import {SideBarMenuType} from "@/types/menu.type";
import {BoardSettingType} from "../../community/board/etc/board.type";

export type BoardMenuCheckedItemType = {
  checkedUsingPrefix: Set<string>;
  checkedAllowedCmt: Set<string>;
  checkedIsAnonymous: Set<string>;
};

export type AdminBoardGridType = {
  firstNodes: SideBarMenuType[];
  secondNodes: BoardSettingType[];
};

export type CheckedRowsType = {
  upperCheckedRow: Set<string>; // role.roleId 저장
  lowerCheckedRow: Set<string>; // roleMenu.idx 저장
  checkedReading: Set<string>; // roleId, menuId 저장
  checkedWriting: Set<string>; // roleId, menuId 저장
};
