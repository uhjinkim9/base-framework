"use client";
import {createContext, useContext, useEffect, useState} from "react";
import {SideBarMenuType} from "@/types/menu.type";
import {MetaFieldType} from "@/components/common/editor/etc/editor.type";
import {newFormState} from "@/components/src/admin/etc/initial-state";
import {FormType} from "@/components/src/docs/etc/docs.type";
import {ModeType} from "@/types/common.type";

const AdminContext = createContext<{
	adminMenus: any;
	setAdminMenus: React.Dispatch<React.SetStateAction<SideBarMenuType>>;
	mode: ModeType;
	setMode: React.Dispatch<React.SetStateAction<ModeType>>;
	form: FormType;
	setForm: React.Dispatch<React.SetStateAction<FormType>>;
	fields: MetaFieldType[];
	setFields: React.Dispatch<React.SetStateAction<MetaFieldType[]>>;
} | null>(null);

export const AdminProvider = ({children}: {children: React.ReactNode}) => {
	const [adminMenus, setAdminMenus] = useState<any>([]);

	// 폼 상태 관리
	const [mode, setMode] = useState<ModeType>("view");
	const [form, setForm] = useState<FormType>(newFormState);
	const [fields, setFields] = useState<MetaFieldType[]>([]); // 폼 메타 필드 배열

	return (
		<AdminContext.Provider
			value={{
				adminMenus,
				setAdminMenus,
				mode,
				setMode,
				form,
				setForm,
				fields,
				setFields,
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
