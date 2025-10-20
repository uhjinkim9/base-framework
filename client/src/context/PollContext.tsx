"use client";
import {createContext, useContext, useReducer, useState} from "react";
import {
  PollAction,
  CurrentPollState,
  initialPollState,
  pollReducer,
} from "@/reducers/poll.reducer";
import {SideBarMenuType} from "@/types/menu.type";
import {PagedDataType} from "@/types/common.type";

const PollContext = createContext<{
  state: CurrentPollState;
  dispatch: React.Dispatch<PollAction>;

  // 설문 사이드바 메뉴
  pollMenus: SideBarMenuType[];
  setPollMenus: React.Dispatch<React.SetStateAction<SideBarMenuType[]>>;

  // 페이지네이션 결과
  paginatedList: PagedDataType;
  setPaginatedList: React.Dispatch<React.SetStateAction<PagedDataType>>;
} | null>(null);

export const PollProvider = ({children}: {children: React.ReactNode}) => {
  const [state, dispatch] = useReducer(pollReducer, initialPollState());
  const [pollMenus, setPollMenus] = useState<SideBarMenuType[]>([]);
  const [paginatedList, setPaginatedList] = useState<PagedDataType>({
    nextPage: 0,
    previousPage: 0,
    results: [],
    totalPage: 0,
  });

  return (
    <PollContext.Provider
      value={{
        state,
        dispatch,
        pollMenus,
        setPollMenus,
        paginatedList,
        setPaginatedList,
      }}
    >
      {children}
    </PollContext.Provider>
  );
};

export const usePollContext = () => {
  const context = useContext(PollContext);
  if (!context) throw new Error("PollProvider가 누락되었습니다.");
  return context;
};
