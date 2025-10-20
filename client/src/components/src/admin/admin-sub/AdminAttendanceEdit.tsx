"use client";
import {useEffect, useState, useRef} from "react";
import {requestPost} from "@/util/api/api-service";
import {getTodayDateWithHyphen} from "@/util/helpers/formatters";
import {EmployeeType, WorkPolicyType} from "@/types/attendance.type";
import {ModeType, PagedDataType} from "@/types/common.type";

import styles from "../styles/AdminAttendanceEdit.module.scss";
import clsx from "clsx";
import AlertService from "@/services/alert.service";
import CheckBox from "@/components/common/form-properties/CheckBox";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import IconNode from "@/components/common/segment/IconNode";
import Divider from "@/components/common/segment/Divider";
import AttendanceListLine from "../inner/AttendanceListLine";
import InputSearch from "@/components/common/form-properties/InputSearch";
import SelectBoxBasic from "@/components/common/form-properties/SelectBoxBasic";
import Pagination from "@/components/common/layout/Pagination";

const ListHeader = ({
  onSelectAll,
  isAllSelected,
}: {
  onSelectAll?: () => void;
  isAllSelected?: boolean;
}) => (
  <div className={clsx(styles.lineWrapper, styles.headerRow)}>
    <div className={styles.check}>
      <CheckBox
        componentType="orange"
        value={isAllSelected}
        onChange={onSelectAll}
      />
    </div>
    <div className={styles.userId}>ID</div>
    <div className={styles.korNm}>성명</div>
    <div className={styles.checkInTime}>출근 시간</div>
    <div className={styles.checkOutTime}>퇴근 시간</div>

    <div className={styles.status}>상태</div>
    <div className={styles.workMin}>근무 시간</div>
    <div className={styles.overTimeMin}>초과 근무</div>
    <div className={styles.nightMin}>야간 근무</div>
    <div className={styles.holidayMin}>휴일 근무</div>
    <div className={styles.editBtn}>수정</div>
  </div>
);

export default function AdminAttendanceEdit() {
  const [paginatedList, setPaginatedList] = useState<PagedDataType | null>(
    null,
  );
  const {results: employees, totalPage} = paginatedList || {
    results: [],
    totalPage: 0,
  };

  const [mode, setMode] = useState<ModeType>("view");
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);

  const todayDate = getTodayDateWithHyphen();
  const [logRange, setLogRange] = useState<string>(todayDate);

  const [searchInput, setSearchInput] = useState<string>(""); // 인풋 입력용
  const [searchKeyword, setSearchKeyword] = useState<string>(""); // 실제 필터링용
  const [selectedSearchCategory, setSelectedSearchCategory] =
    useState<string>("all");

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const searchCategoryOptions = [
    {label: "전체", value: "all"},
    {label: "ID", value: "userId"},
    {label: "성명", value: "korNm"},
  ];

  const onChangeEditingPolicy = (e: React.ChangeEvent<any>, userId: string) => {
    const {name, value} = e.target;
    setPaginatedList((prev: PagedDataType | null) => {
      if (!prev) return prev;
      const updatedResults = prev.results.map((employee: EmployeeType) => {
        if (employee.userId === userId && employee.attendanceLogs?.[0]) {
          const updatedLogs = [...employee.attendanceLogs];
          updatedLogs[0] = {
            ...updatedLogs[0],
            [name]: value, // 값 그대로 저장
          };
          return {
            ...employee,
            attendanceLogs: updatedLogs,
          };
        }
        return employee;
      });
      return {...prev, results: updatedResults};
    });
  };

  const getPaginatedEmployees = async (page?: number) => {
    const requestData = {
      option: {
        page: page ?? currentPage,
        limit: 10, // 페이지당 10개
        logRange,
        searchKeyword,
        searchCategory: selectedSearchCategory,
      },
    };

    const res = await requestPost(
      "/attendance/getPaginatedEmployees",
      requestData,
    );
    if (res.statusCode === 200) {
      setPaginatedList(res.data);
    }
  };
  useEffect(() => {
    getPaginatedEmployees();
    console.log("logRange", logRange);
  }, [logRange, currentPage, searchKeyword, selectedSearchCategory]);

  const onClickEdit = async (userId: string) => {
    setMode("edit");
    setEditingPolicyId(userId);
  };

  const handleSaveEdit = async (userId: string) => {
    try {
      const editingEmployee = employees?.find((e) => e.userId === userId);
      if (!editingEmployee || !editingEmployee.attendanceLogs?.[0]) return;

      const attendanceLog = editingEmployee.attendanceLogs[0];
      const requestData = {
        userId: userId,
        logIdx: attendanceLog.logIdx,
        checkInTime: attendanceLog.checkInTime,
        checkOutTime: attendanceLog.checkOutTime,
        workDate: attendanceLog.workDate,
      };

      const res = await requestPost(
        "/attendance/updateAttendanceLog",
        requestData,
      );

      if (res.statusCode === 200) {
        AlertService.success(res.message);
        setMode("view");
        setEditingPolicyId(null);
        // 데이터 새로고침
        getPaginatedEmployees();
      } else {
        console.error("API 실패 응답:", res);
        AlertService.error(
          `출퇴근 시간 변경에 실패했습니다: ${
            res.message || "알 수 없는 오류"
          }`,
        );
      }
    } catch (error) {
      console.error("handleSaveEdit 에러:", error);
      AlertService.error("출퇴근 시간 변경 중 오류가 발생했습니다.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, userId: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(userId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    setMode("view");
    setEditingPolicyId(null);
    // 원래 데이터로 되돌리기 위해 다시 fetch
    getPaginatedEmployees();
  };

  // 매핑 업데이트 핸들러
  const handleMappingUpdate = (policyId: string, groupName: string) => {
    // 전체 데이터 새로고침 (더 정확한 데이터 동기화)
    getPaginatedEmployees();
  };

  // 날짜 이동 함수
  const shiftLogRange = (direction: number) => {
    // 현재 logRange는 'YYYY-MM-DD' 형식
    const current = new Date(logRange);
    current.setDate(current.getDate() + direction);
    const nextDate = current.toISOString().slice(0, 10);
    setLogRange(nextDate);
  };

  // 검색 핸들러 함수들
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleSearchSubmit = () => {
    // 엔터키나 검색 버튼 클릭시 인풋 값을 필터링용 state로 복사
    setSearchKeyword(searchInput.trim());
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleSearchCategoryChange = (category: string) => {
    setSelectedSearchCategory(category);
    setCurrentPage(1); // 카테고리 변경 시 첫 페이지로 이동
  };

  return (
    <div className={styles.listWrapper}>
      <div className={styles.mailListContainer}>
        <div className={styles.mailListHeader}>
          <div className={styles.shift}>
            <IconNode
              iconName="chevronLeft"
              size={20}
              onClick={() => shiftLogRange(-1)}
              color="gray5"
            />
            <span className={styles.date}>{logRange}</span>
            <IconNode
              iconName="chevronRight"
              size={20}
              onClick={() => shiftLogRange(1)}
              color="gray5"
            />
          </div>
          <div className={clsx(styles.row, styles.gap05rem)}>
            <SelectBoxBasic
              value={selectedSearchCategory}
              customOptions={searchCategoryOptions}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleSearchCategoryChange(e.target.value)
              }
              width="5rem"
            />
            <InputSearch
              componentType="inList"
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchInput(e.target.value)
              }
              onKeyDown={handleSearchKeyDown}
              onClickSearch={handleSearchSubmit}
            />
            <ButtonBasic componentType="basic" onClick={handleSearchSubmit}>
              검색
            </ButtonBasic>
          </div>
        </div>
        <ListHeader
        // onSelectAll={handleSelectAll}
        // isAllSelected={isAllSelected || false}
        />
        {paginatedList?.results && paginatedList.results.length > 0 ? (
          paginatedList.results.map((e: EmployeeType, index: number) => {
            return (
              <AttendanceListLine
                key={e.userId}
                onClickEdit={() => onClickEdit(e.userId ?? "unknown")}
                data={e}
                mode={mode}
                setMode={setMode}
                isEditingThis={editingPolicyId === e.userId}
                onChangeEditing={(event: React.ChangeEvent<any>) =>
                  onChangeEditingPolicy(event, e.userId || "")
                }
                handleKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(event, e.userId || "")
                }
                handleSaveEdit={() => handleSaveEdit(e.userId || "")}
              />
            );
          })
        ) : (
          <div className={styles.noContact}>근태 기록이 없습니다.</div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPage}
          onPageChange={paginate}
        />
        <Divider type="none" />
      </div>
    </div>
  );
}
