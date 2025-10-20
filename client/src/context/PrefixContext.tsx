"use client";
import {createContext, useContext, useState, ReactNode, useEffect} from "react";
import {requestPost} from "@/util/api/api-service";
import {isNotEmpty} from "@/util/validators/check-empty";

type PrefixContextType = {
	matchPrefixData: (codeClass: string) => string;
};

const PrefixContext = createContext<PrefixContextType>({
	matchPrefixData(codeClass: string) {
		return "";
	},
});

// 말머리 영문/한글 맵 생성
async function getPrefixData(codeClass: string) {
	const res = await requestPost("/menu/getSettingCode", {
		codeClass: codeClass,
	});
	if (isNotEmpty(res)) {
		const prefixMap = res[0]?.detail?.map((pre: any) => ({
			code: pre.code,
			codeNm: pre.codeNm,
		}));
		return prefixMap;
	}
	return [];
}

export const PrefixProvider = ({children}: {children: ReactNode}) => {
	const [prefixData, setPrefixData] = useState<
		{
			code: string;
			codeNm: string;
		}[]
	>();

	useEffect(() => {
		getPrefixData("post-prefix").then((data) => {
			setPrefixData(data);
		});
	}, []);

	// 말머리 영문/한글 매칭 함수
	function matchPrefixData(code: string): string {
		const prefix = prefixData?.find((u) => code === u.code);
		return prefix ? `${prefix.codeNm || ""}` : "";
	}

	return (
		<PrefixContext.Provider value={{matchPrefixData}}>
			{children}
		</PrefixContext.Provider>
	);
};

export const usePrefixData = () => {
	return useContext(PrefixContext);
};
