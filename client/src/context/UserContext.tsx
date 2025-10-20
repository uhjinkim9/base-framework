"use client";
import {createContext, useContext, useState, ReactNode, useEffect} from "react";

import {requestPost} from "@/util/api/api-service";
import {LocalStorage} from "@/util/common/storage";

import {UserErpType} from "@/types/user.type";
import AlertService from "@/services/alert.service";

// 유저 컨텍스트 생성
const UserContext = createContext<{
  userRankMap: UserErpType[];
  matchUserIdToRank: (comparedId: string) => string;
  matchEmpNoToRank: (empNo: string) => string;
  matchDeptCdToDeptNm: (deptCd: string) => string;
} | null>({
  userRankMap: [],
  matchUserIdToRank(comparedId: string) {
    return "";
  },
  matchEmpNoToRank(empNo: string) {
    return "";
  },
  matchDeptCdToDeptNm(deptCd: string) {
    return "";
  },
});

async function getAllUserErpInfo(): Promise<UserErpType[]> {
  const res = await requestPost("/mail/getContacts");
  if (res.statusCode === 200) {
    return res.data;
  } else {
    return [];
  }
}

export const UserProvider = ({children}: {children: ReactNode}) => {
  const [userRankMap, setUserRankMap] = useState<UserErpType[]>([]);
  const userId = LocalStorage.getUserId(); // 로컬 스토리지에서 사용자 ID 가져오기

  const fetchUserErpInfo = async () => {
    if (userId) {
      // 1. 전체 사용자 ERP 정보 가져오기
      const allUsers = await getAllUserErpInfo();
      // 2. 사용자 데이터 변환
      const userMap = allUsers.map((u) => ({
        userId: u.userId,
        empNo: u.empNo,
        korNm: u.korNm,
        deptCd: u.deptCd,
        deptNm: u.deptNm,
        posNm: u.posNm,
        dutyNm: u.dutyNm,
      }));

      // 3. 상태 업데이트
      setUserRankMap(userMap);
    }
  };

  useEffect(() => {
    fetchUserErpInfo();
  }, [userId]);

  function matchUserIdToRank(comparedId: string): string {
    const user = userRankMap.find(
      (u) => u.userId?.trim() === comparedId.trim(),
    );
    return user ? `${user.korNm || "Unknown"} ${user.posNm || ""}` : "Unknown";
  }

  function matchEmpNoToRank(pluralEmpNo: string): string {
    const empsNo = pluralEmpNo.split(",");
    const users = new Set(
      empsNo
        .map((empNo) => {
          const found = userRankMap.find((u) => u.empNo === empNo);
          return found ? `${found.korNm} ${found.posNm}` : null;
        })
        .filter(Boolean), // null 제거
    );
    const usersArr = [...users].join(", ");
    return usersArr;
  }

  function matchDeptCdToDeptNm(deptCd: string): string {
    const user = userRankMap.find((u) => u.deptCd === deptCd);
    return user?.deptNm ?? "";
  }

  return (
    <UserContext.Provider
      value={{
        userRankMap,
        matchUserIdToRank,
        matchEmpNoToRank,
        matchDeptCdToDeptNm,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("UserProvider가 누락되었습니다.");
  }
  return context;
};
