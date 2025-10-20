import {requestPost} from "../api/api-service";
import {RoleMenuMapType} from "@/types/user-role.type";

/** 유저 역할에 해당 메뉴 권한이 포함되는지 판별하는 함수 */
export async function checkIsManager(menuId: string): Promise<boolean> {
	const userId = localStorage.getItem("userId");
	if (!userId) return false;
	if (!menuId) return false;

	const res = await requestPost("/auth/getUserRoleMenus", {userId: userId});
	if (res.statusCode === 200) {
		console.log("role:", res.data);

		if (res.data.roleId === "dev") {
			return true;
		}
		const isManager = await res.data.includes(
			(r: RoleMenuMapType) => r.menuId
		);
		console.log("isManager:", isManager);

		return isManager;
	} else {
		console.error("응답 실패:", res.message);
		return false;
	}
}
