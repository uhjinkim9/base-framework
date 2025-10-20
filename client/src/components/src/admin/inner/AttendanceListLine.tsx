"use client";
import {useState, useEffect} from "react";
import {EmployeeType, WorkPolicyType} from "@/types/attendance.type";
import {ModeType} from "@/types/common.type";

import styles from "../styles/AdminAttendanceEdit.module.scss";
import clsx from "clsx";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import InputBasic from "@/components/common/form-properties/InputBasic";
import CheckBox from "@/components/common/form-properties/CheckBox";
import Modal from "@/components/common/layout/Modal";
import useModal from "@/hooks/useModal";
import PolicyGroupMapping from "../modal/PolicyGroupMapping";

export default function AttendanceListLine({
  data,
  isSelected = false,
  onClickEdit,
  mode,
  setMode,
  isEditingThis = false,
  onChangeEditing,
  handleKeyDown,
  handleSaveEdit,
}: {
  data: EmployeeType;
  isSelected?: boolean;
  onClickEdit?: () => void;
  onCheck?: () => void;
  mode: ModeType;
  setMode: (mode: ModeType) => void;
  isEditingThis?: boolean;
  onChangeEditing?: (e: React.ChangeEvent<any>) => void;
  handleKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement>,
    userId: string,
  ) => void;
  handleSaveEdit?: () => void;
}) {
  const [policyGroups, setPolicyGroups] = useState<any[]>([]);

  // 시간(분)을 00h 00m 형식으로 변환하는 공통 함수
  const formatMinutesToHours = (minutes: number | undefined): string => {
    if (minutes === undefined || minutes === null) return "-";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const isEditing = mode === "edit" && isEditingThis;

  // 그룹 목록 가져오기
  // const fetchPolicyGroups = async () => {
  //   try {
  //     const res = await requestPost("/attendance/getPolicyGroups");
  //     if (res.statusCode === 200) {
  //       setPolicyGroups(res.data);
  //     }
  //   } catch (error) {
  //     console.error("그룹 목록 조회 오류:", error);
  //   }
  // };
  // useEffect(() => {
  //   fetchPolicyGroups();
  // }, []);

  // const isEditing = mode === "edit" && isEditingThisPolicy;

  const {openModal, closeModal, modalConfig} = useModal();

  // 매핑 성공 콜백 처리
  // const handleMappingSuccess = (groupIdx: number, groupName: string) => {
  //   setMappedGroupName(groupName);
  //   if (onMappingUpdate && data.policyId) {
  //     onMappingUpdate(data.policyId, groupName);
  //   }
  // };

  // 표시용 (포맷팅된 값)
  const checkInTime = data.attendanceLogs?.[0]?.checkInTime ?? "-";
  const checkOutTime = data.attendanceLogs?.[0]?.checkOutTime ?? "-";

  return (
    <>
      <div className={clsx(styles.lineWrapper, isSelected && styles.selected)}>
        <div className={styles.check}>
          <CheckBox componentType="orange" value={isSelected} />
        </div>

        <div className={styles.userId}>
          {/* {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="text"
                name="policyNm"
                value={data?.policyNm || ""}
                onChange={onChangeEditingPolicy}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e, data.policyId || "")
                }
                autoFocus={true}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{data.policyNm}</span>
            )} */}
          <span>{data.userId}</span>
        </div>

        <div className={styles.korNm}>
          <span>{data.korNm}</span>
        </div>

        <div className={styles.checkInTime}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="time"
                name="checkInTime"
                value={checkInTime}
                onChange={onChangeEditing}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{checkInTime}</span>
          )}
        </div>

        <div className={styles.checkOutTime}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="time"
                name="checkOutTime"
                value={checkOutTime}
                onChange={onChangeEditing}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{checkOutTime}</span>
          )}
        </div>

        <div className={styles.status}>
          <span>
            {data.attendanceLogs && data.attendanceLogs.length > 0
              ? data.attendanceLogs[0].status === "checkOut"
                ? "퇴근"
                : "출근"
              : "미출근"}
          </span>
        </div>

        <div className={styles.workMin}>
          <span>{formatMinutesToHours(data.attendanceLogs?.[0]?.workMin)}</span>
        </div>

        <div className={styles.overTimeMin}>
          <span>
            {formatMinutesToHours(data.attendanceLogs?.[0]?.overtimeMin)}
          </span>
        </div>

        <div className={styles.nightMin}>
          <span>
            {formatMinutesToHours(data.attendanceLogs?.[0]?.nightMin)}
          </span>
        </div>

        <div className={styles.holidayMin}>
          <span>
            {formatMinutesToHours(data.attendanceLogs?.[0]?.holidayMin)}
          </span>
        </div>

        <div className={styles.editBtn}>
          <ButtonBasic onClick={isEditing ? handleSaveEdit : onClickEdit}>
            {isEditing ? "저장" : "수정"}
          </ButtonBasic>
        </div>
      </div>

      <Modal
        modalConfig={modalConfig}
        closeModal={closeModal}
        modalTitle={"그룹 목록"}
        width={"30vw"}
        height={"35vh"}
        // footerContent={
        //   <CommonButtonGroup
        //     usedButtons={{btnSubmit: true}}
        //     onSubmit={createOrUpdateBoard}
        //     submitBtnLabel={mode === "edit" ? "수정" : "등록"}
        //   />
        // }
      >
        <PolicyGroupMapping
          // data={data}
          // onMappingSuccess={handleMappingSuccess}
          onCloseModal={closeModal}
        />
      </Modal>
    </>
  );
}
