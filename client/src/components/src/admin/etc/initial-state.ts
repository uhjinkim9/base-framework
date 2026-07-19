import {generateEightDigitNum} from "@/util/helpers/random-generator";
import {LocalStorage} from "@/util/common/storage";

import {MenuType} from "@/types/menu.type";
import {RoleMenuMapType, RoleType} from "@/types/user-role.type";
import {CheckedRowsType} from "./admin-type";

export const newMenuState = (
  type?: "upper" | "lower",
  showingLowerMenuId?: string,
): MenuType => {
  const id = generateEightDigitNum();

  return {
    tempIdx: id,
    idx: undefined,
    menuId: "",
    menuNm: "",
    nodeLevel: type === "upper" ? 1 : 2,
    upperNode: type === "lower" ? showingLowerMenuId : "",
    isUsed: true,
    isChangeable: false,
    seqNum: "1",
  };
};
export const newRoleState = (): RoleType => {
  const id = generateEightDigitNum();
  const userId = LocalStorage.getUserId();

  return {
    tempIdx: id,
    roleId: "",
    roleNm: "",
    memo: "",
    creatorId: userId,
    updaterId: userId,
    isUsed: true,
  };
};
export const newRoleMenuState = (): RoleMenuMapType => {
  const userId = LocalStorage.getUserId();

  return {
    roleId: "",
    menuId: "",
    creatorId: userId,
    updaterId: userId,
    // isWritable: false,
    // isReadable: false,
    roleUser: false,
    roleAdmin: false,
    isUsed: true,
  };
};

export const initialCheckedRowsType: CheckedRowsType = {
  upperCheckedRow: new Set<string>(),
  lowerCheckedRow: new Set<string>(),
  checkedReading: new Set<string>(),
  checkedWriting: new Set<string>(),
};
