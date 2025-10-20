"use client";
import {
	createContext,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";
import {SideBarMenuType} from "@/types/menu.type";
import {PagedDataType} from "@/components/common/form-properties/types/common.type";
import {DocAction, docReducer} from "@/reducers/doc.reducer";
import {DocStateType, FormType} from "@/components/src/docs/etc/docs.type";
import {
	initialDocState,
	initialFormState,
} from "@/reducers/etc/doc-initial-state";

const DocsContext = createContext<{
	docsMenus: SideBarMenuType[];
	setDocsMenus: React.Dispatch<React.SetStateAction<SideBarMenuType[]>>;
	paginatedList: PagedDataType;
	setPaginatedList: React.Dispatch<React.SetStateAction<PagedDataType>>;
	docState: DocStateType;
	docDispatch: React.Dispatch<DocAction>;
	formKind: string;
	setFormKind: React.Dispatch<React.SetStateAction<string>>;
	form: FormType;
	setForm: React.Dispatch<React.SetStateAction<FormType>>;
} | null>(null);

export const DocsProvider = ({children}: {children: React.ReactNode}) => {
	const [formKind, setFormKind] = useState("");
	const [docsMenus, setDocsMenus] = useState<any>([]);
	const [paginatedList, setPaginatedList] = useState<PagedDataType>({
		nextPage: 0,
		previousPage: 0,
		results: [],
		totalPage: 0,
	});
	const [docState, docDispatch] = useReducer(docReducer, initialDocState);
	const [form, setForm] = useState(initialFormState);

	return (
		<DocsContext.Provider
			value={{
				docsMenus,
				setDocsMenus,
				paginatedList,
				setPaginatedList,
				docState,
				docDispatch,
				formKind,
				setFormKind,
				form,
				setForm,
			}}
		>
			{children}
		</DocsContext.Provider>
	);
};

export const useDocsContext = () => {
	const context = useContext(DocsContext);
	if (!context) {
		throw new Error("DocsProvider가 누락되었습니다.");
	}
	return context;
};
