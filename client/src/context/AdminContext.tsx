"use client";
import {createContext, useContext, useEffect, useState} from "react";
import {SideBarMenuType} from "@/types/menu.type";
import {ModeType} from "@/types/common.type";

const AdminContext = createContext<{
	adminMenus: any;
	setAdminMenus: React.Dispatch<React.SetStateAction<SideBarMenuType>>;
	mode: ModeType;
	setMode: React.Dispatch<React.SetStateAction<ModeType>>;
} | null>(null);

export const AdminProvider = ({children}: {children: React.ReactNode}) => {
	const [adminMenus, setAdminMenus] = useState<any>([]);

	const [mode, setMode] = useState<ModeType>("view");

	return (
		<AdminContext.Provider
			value={{
				adminMenus,
				setAdminMenus,
				mode,
				setMode,
			}}
		>
			{children}
		</AdminContext.Provider>
	);
};

export const useAdminContext = () => {
	const context = useContext(AdminContext);
	if (!context) {
		throw new Error("AdminProvider가 누락되었습니다.");
	}
	return context;
};
