"use client";
import { createContext, useContext, useState } from "react";
import { SideBarMenuType } from "@/types/menu.type";

const DraftContext = createContext<{
  // 결재 사이드바 메뉴들
  draftMenus: any;
  setDraftMenus: React.Dispatch<React.SetStateAction<SideBarMenuType>>;
} | null>(null);

export const DraftProvider = ({ children }: { children: React.ReactNode }) => {
  const [draftMenus, setDraftMenus] = useState<any>([]);

  return (
    <DraftContext.Provider value={{ draftMenus, setDraftMenus }}>
      {children}
    </DraftContext.Provider>
  );
};

export const useDraftContext = () => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error("DraftProvider가 누락되었습니다.");
  }
  return context;
};
