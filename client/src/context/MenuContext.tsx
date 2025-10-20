"use client";
import {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
	useCallback,
} from "react";
import {requestPost} from "@/util/api/api-service";
import {MenuType} from "@/types/menu.type";
import {isNotEmpty} from "@/util/validators/check-empty";
import {SessionStorage} from "@/util/common/storage";

const MenuContext = createContext<{
	menuData: MenuType[];
	expandedMenus: string[];
	toggleMenuExpansion: (menuId: string) => void;
	refreshMenu: () => Promise<void>;
	matchMenuCode: (menuId: string) => string;
	filterFirstNodes: (nodes: MenuType[]) => MenuType[];
	filterSecondNodes: (upperNodeId: string) => MenuType[];
} | null>(null);

async function getMenus(): Promise<MenuType[]> {
	const res = await requestPost("/menu/getMenus", {isUsed: true});
	if (isNotEmpty(res.data)) {
		return await res.data;
	}
	return [];
}

// Provider 역할 컴포넌트: 하위 컴포넌트들에게 menuData 전달
export const MenuProvider = ({children}: {children: ReactNode}) => {
	const [menuData, setMenuData] = useState<MenuType[]>([]);
	const [menuMap, setMenuMap] = useState<Partial<MenuType>[]>([]);
	const [expandedMenus, setExpandedMenus] = useState<string[]>(
		SessionStorage.getItem<string[]>("expandedMenus") ?? []
	);

	const refreshMenu = useCallback(async () => {
		const data = await getMenus();
		setMenuData(data);
	}, []);

	const toggleMenuExpansion = (menuId: string) => {
		setExpandedMenus((prev) =>
			prev?.includes(menuId)
				? prev.filter((id) => id !== menuId)
				: [...(prev || []), menuId]
		);
	};

	const filterFirstNodes = (nodes: MenuType[]) => {
		return nodes
			.filter((node) => node.nodeLevel === 1)
			.sort((a, b) => Number(a.seqNum) - Number(b.seqNum));
	};

	const filterSecondNodes = (upperNodeId: string) => {
		return menuData
			.filter(
				(menu) => menu.nodeLevel === 2 && menu.upperNode === upperNodeId
			)
			.sort((a, b) => Number(a.seqNum) - Number(b.seqNum));
	};

	useEffect(() => {
		if (typeof window !== "undefined") {
			const accessToken = localStorage.getItem("accessToken");
			if (isNotEmpty(accessToken)) {
				refreshMenu();
			}
		}
	}, [refreshMenu]);

	useEffect(() => {
		mapMenuCode();
	}, [menuData]);

	useEffect(() => {
		SessionStorage.setItem("expandedMenus", expandedMenus);
	}, [expandedMenus]);

	function mapMenuCode() {
		const menuMap = menuData.map((menu) => {
			return {
				nodeLevel: menu.nodeLevel,
				upperNode: menu.upperNode,
				menuId: menu.menuId,
				menuNm: menu.menuNm,
			};
		});
		setMenuMap(() => menuMap);
	}

	function matchMenuCode(comparedMenuId: string): string {
		const menu = menuMap.find((u) => comparedMenuId === u.menuId);
		return menu ? `${menu.menuNm || ""}` : "";
	}

	return (
		<MenuContext.Provider
			value={{
				menuData,
				expandedMenus,
				toggleMenuExpansion,
				refreshMenu,
				matchMenuCode,
				filterFirstNodes,
				filterSecondNodes,
			}}
		>
			{children}
		</MenuContext.Provider>
	);
};

export const useMenuData = () => {
	const context = useContext(MenuContext);
	if (!context) {
		throw new Error("MenuProvider가 누락되었습니다.");
	}
	return context;
};
