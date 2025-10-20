"use client";
import {useState, useEffect} from "react";
import {WorkPolicyType} from "@/types/attendance.type";
import {ModeType} from "@/types/common.type";
import {requestPost} from "@/util/api/api-service";

import styles from "../styles/AdminAttendancePolicy.module.scss";
import clsx from "clsx";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import InputBasic from "@/components/common/form-properties/InputBasic";
import CheckBox from "@/components/common/form-properties/CheckBox";
import Modal from "@/components/common/layout/Modal";
import useModal from "@/hooks/useModal";
import PolicyGroupMapping from "../modal/PolicyGroupMapping";

export default function PolicyListLine({
  policy,
  isSelected = false,
  onClickEdit,
  onCheck,
  mode,
  isEditingThisPolicy = false,
  onChangeEditingPolicy,
  handleKeyDown,
  handleSaveEdit,
  onMappingUpdate,
}: {
  policy: WorkPolicyType;
  isSelected?: boolean;
  onClickEdit?: () => void;
  onCheck?: () => void;
  mode: ModeType;
  setMode: (mode: ModeType) => void;
  isEditingThisPolicy?: boolean;
  onChangeEditingPolicy: (e: React.ChangeEvent<any>) => void;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    policyId: string,
  ) => void;
  handleSaveEdit: () => void;
  onMappingUpdate?: (policyId: string, groupName: string) => void;
}) {
  const [policyGroups, setPolicyGroups] = useState<any[]>([]);
  const [mappedGroupName, setMappedGroupName] = useState<string>("");

  // 그룹 목록 가져오기
  const fetchPolicyGroups = async () => {
    try {
      const res = await requestPost("/attendance/getPolicyGroups");
      if (res.statusCode === 200) {
        setPolicyGroups(res.data);
      }
    } catch (error) {
      console.error("그룹 목록 조회 오류:", error);
    }
  };

  // 매핑된 그룹명 계산
  const calculateMappedGroupName = () => {
    const groupIdx = policy.empWorkPolicy?.[0]?.groupIdx;
    if (groupIdx && policyGroups.length > 0) {
      const group = policyGroups.find((g) => g.groupIdx === groupIdx);
      return group?.groupNm || "할당 전";
    }
    return "할당 전";
  };

  // 컴포넌트 마운트 시 그룹 목록 가져오기
  useEffect(() => {
    fetchPolicyGroups();
  }, []);

  // policyGroups가 로드되거나 policy.empWorkPolicy가 변경될 때마다 그룹명 업데이트
  useEffect(() => {
    const groupName = calculateMappedGroupName();
    setMappedGroupName(groupName);
  }, [policyGroups, policy.empWorkPolicy]);

  const isEditing = mode === "edit" && isEditingThisPolicy;

  const {openModal, closeModal, modalConfig} = useModal();

  // 매핑 성공 콜백 처리
  const handleMappingSuccess = (groupIdx: number, groupName: string) => {
    setMappedGroupName(groupName);
    if (onMappingUpdate && policy.policyId) {
      onMappingUpdate(policy.policyId, groupName);
    }
  };

  return (
    <>
      <div className={clsx(styles.lineWrapper, isSelected && styles.selected)}>
        <div className={styles.check}>
          <CheckBox
            componentType="orange"
            value={isSelected}
            onChange={onCheck}
          />
        </div>
        <div className={styles.policyNm}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="text"
                name="policyNm"
                value={policy?.policyNm || ""}
                onChange={onChangeEditingPolicy}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e, policy.policyId || "")
                }
                autoFocus={true}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{policy.policyNm}</span>
          )}
        </div>

        <div className={styles.weeklyHours}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="number"
                name="weeklyHours"
                value={policy?.weeklyHours || ""}
                onChange={onChangeEditingPolicy}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{policy.weeklyHours}</span>
          )}
        </div>

        <div className={styles.breakStart}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="time"
                name="breakStart"
                value={policy?.breakStart || ""}
                onChange={onChangeEditingPolicy}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{policy.breakStart}</span>
          )}
        </div>

        <div className={styles.breakEnd}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="time"
                name="breakEnd"
                value={policy?.breakEnd || ""}
                onChange={onChangeEditingPolicy}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{policy.breakEnd}</span>
          )}
        </div>

        <div className={styles.coreEnd}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="time"
                name="coreEnd"
                value={policy?.coreEnd || ""}
                onChange={onChangeEditingPolicy}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{policy.coreEnd}</span>
          )}
        </div>

        <div className={styles.coreStart}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="time"
                name="coreStart"
                value={policy?.coreStart || ""}
                onChange={onChangeEditingPolicy}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{policy.coreStart}</span>
          )}
        </div>

        <div className={styles.coreEnd}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="time"
                name="coreEnd"
                value={policy?.coreEnd || ""}
                onChange={onChangeEditingPolicy}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{policy.coreEnd}</span>
          )}
        </div>

        <div className={styles.defaultStart}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="time"
                name="defaultStart"
                value={policy?.defaultStart || ""}
                onChange={onChangeEditingPolicy}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{policy.defaultStart}</span>
          )}
        </div>

        <div className={styles.defaultEnd}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="time"
                name="defaultEnd"
                value={policy?.defaultEnd || ""}
                onChange={onChangeEditingPolicy}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{policy.defaultEnd}</span>
          )}
        </div>

        <div className={styles.autoCheckout}>
          {isEditing ? (
            <div onClick={(e) => e.stopPropagation()}>
              <CheckBox
                componentType="orange"
                name="autoCheckout"
                checkValue={policy?.autoCheckout || false}
                value={policy?.autoCheckout || false}
                onChange={onChangeEditingPolicy}
              />
            </div>
          ) : (
            <span>{policy.autoCheckout ? "ㅇㅇ" : "ㄴㄴ"}</span>
          )}
        </div>

        <div className={styles.mappedEmp}>
          <ButtonBasic onClick={openModal}>보기</ButtonBasic>
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
          policy={policy}
          onMappingSuccess={handleMappingSuccess}
          onCloseModal={closeModal}
        />
      </Modal>
    </>
  );
}
