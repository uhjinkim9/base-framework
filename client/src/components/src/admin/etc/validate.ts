import AlertService from "@/services/alert.service";

import {MenuType} from "@/types/menu.type";
import {RoleMenuMapType, RoleType} from "@/types/user-role.type";

export const validateMenu = (menu: MenuType): boolean => {
  // menuId
  if (!menu.menuId || menu.menuId.trim() === "") {
    AlertService.error("메뉴 ID를 입력해주세요.");
    return false;
}
  // menuNm
  if (!menu.menuNm || menu.menuNm.trim() === "") {
    AlertService.error("메뉴명을 입력해주세요.");
    return false;
  }
  // nodeLevel
  if (!menu.nodeLevel || isNaN(menu.nodeLevel)) {
    AlertService.error("노드 레벨을 입력해주세요.");
    return false;
  }
  if (menu.nodeLevel < 0) {
    AlertService.error("노드 레벨은 음수일 수 없습니다.");
  }
  return true;
};
export const validateRole = (role: RoleType): boolean => {
  // menuId
  if (!role.roleId || role.roleId.trim() === "") {
    AlertService.error("역할 ID를 입력해주세요.");
    return false;
  }
  // roleNm
  if (!role.roleNm || role.roleNm.trim() === "") {
    AlertService.error("역할명을 입력해주세요.");
    return false;
  }
  return true;
};
export const validateRoleMenu = (roleMenu: RoleMenuMapType): boolean => {
  // menuId
  if (!roleMenu.menuId || roleMenu.menuId.trim() === "") {
    AlertService.error("메뉴 ID를 입력해주세요.");
    return false;
  }
  return true;
};

export const validateRoleAssignment = (roleId: string): boolean => {
  if (!roleId || roleId.trim() === "") {
    AlertService.error("역할 ID를 입력해주세요.");
    return false;
  }
  return true;
};
