"use client";
import {createContext, useContext, useState} from "react";
import {SideBarMenuType} from "@/types/menu.type";

const FormContext = createContext<{
	adminMenus: any;
	setFormMenus: React.Dispatch<React.SetStateAction<SideBarMenuType>>;
} | null>(null);

export const FormProvider = ({children}: {children: React.ReactNode}) => {
	const [adminMenus, setFormMenus] = useState<any>([]);

	return (
		<FormContext.Provider
			value={{
				adminMenus,
				setFormMenus,
			}}
		>
			{children}
		</FormContext.Provider>
	);
};

export const useFormContext = () => {
	const context = useContext(FormContext);
	if (!context) {
		throw new Error("FormProvider가 누락되었습니다.");
	}
	return context;
};
