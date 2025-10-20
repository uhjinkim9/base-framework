"use client";
import {createContext, useContext, useMemo, useState} from "react";
import {SideBarMenuSortType} from "@/types/menu.type";
import {PagedDataType, SelectOptionType} from "@/types/common.type";

const MailContext = createContext<{
  mailMenus: SideBarMenuSortType;
  setMailMenus: React.Dispatch<React.SetStateAction<SideBarMenuSortType>>;
  paginatedList: PagedDataType;
  setPaginatedList: React.Dispatch<React.SetStateAction<PagedDataType>>;
  privateMenus: SelectOptionType[];
} | null>(null);

export const MailProvider = ({children}: {children: React.ReactNode}) => {
  const [mailMenus, setMailMenus] = useState<SideBarMenuSortType>({
    public: [],
    private: [],
  });
  const [paginatedList, setPaginatedList] = useState<PagedDataType>({
    nextPage: 0,
    previousPage: 0,
    results: [],
    totalPage: 0,
  });

  const privateMenus: SelectOptionType[] = useMemo(() => {
    return (
      mailMenus?.private?.map((menu) => ({
        label: menu.menuNm,
        value: menu.menuId,
        idx: menu.menuIdx,
      })) || []
    );
  }, [mailMenus]);

  return (
    <MailContext.Provider
      value={{
        mailMenus,
        setMailMenus,
        paginatedList,
        setPaginatedList,
        privateMenus,
      }}
    >
      {children}
    </MailContext.Provider>
  );
};

export const useMailContext = () => {
  const context = useContext(MailContext);
  if (!context) {
    throw new Error("MailProvider가 누락되었습니다.");
  }
  return context;
};
