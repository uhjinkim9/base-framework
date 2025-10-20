"use client";
import styles from "../styles/AdminAttendancePolicy.module.scss";
import {useEffect, useState} from "react";

import {requestPost} from "@/util/api/api-service";
import {WorkPolicyType} from "@/types/attendance.type";
import {ModeType} from "@/types/common.type";

import clsx from "clsx";
import AlertService from "@/services/alert.service";
import PolicyListLine from "../inner/PolicyListLine";
import CheckBox from "@/components/common/form-properties/CheckBox";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import IconNode from "@/components/common/segment/IconNode";
import Divider from "@/components/common/segment/Divider";

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
    <div className={styles.policyNm}>정책명</div>
    <div className={styles.weeklyHours}>주간 근무 시간</div>
    <div className={styles.defaultStart}>근무 시작</div>
    <div className={styles.defaultEnd}>근무 종료</div>
    <div className={styles.breakStart}>휴식 시작</div>
    <div className={styles.breakEnd}>휴식 종료</div>
    <div className={styles.coreStart}>코어 근무 시작</div>
    <div className={styles.coreEnd}>코어 근무 종료</div>
    <div className={styles.autoCheckout}>자동 퇴근</div>
    <div className={styles.mappedEmp}>직원 그룹</div>
    <div className={styles.editBtn}>수정</div>
  </div>
);

export default function AdminAttendancePolicy() {
  const [workPolicies, setWorkPolicies] = useState<WorkPolicyType[] | null>(
    null,
  );
  const [mode, setMode] = useState<ModeType>("view");
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [selectedPolicies, setSelectedPolicies] = useState<Set<string>>(
    new Set(),
  );

  const onChangeEditingPolicy = (
    e: React.ChangeEvent<any>,
    policyId: string,
  ) => {
    const {name, value} = e.target;
    setWorkPolicies((prev) =>
      prev
        ? prev.map((policy) =>
            policy.policyId === policyId ? {...policy, [name]: value} : policy,
          )
        : [],
    );
  };

  const getWorkPolicies = async () => {
    const res = await requestPost("/attendance/getWorkPolicies");
    if (res.statusCode === 200) {
      setWorkPolicies(res.data);
    }
  };
  useEffect(() => {
    getWorkPolicies();
  }, []);

  const addPolicy = async () => {
    const newPolicy: WorkPolicyType = {
      policyNm: "새 정책",
      weeklyHours: 0,
    };

    const res = await requestPost("/attendance/insertWorkPolicy", newPolicy);
    if (res.statusCode === 200) {
      AlertService.success(res.message);
      setWorkPolicies((prev) => (prev ? [...prev, res.data] : [res.data]));
    }
  };

  const onClickEdit = async (policyId: string) => {
    setMode("edit");
    setEditingPolicyId(policyId);
  };

  const handleSaveEdit = async (policyId: string) => {
    try {
      const editingPolicy = workPolicies?.find((p) => p.policyId === policyId);
      if (!editingPolicy) return;

      const requestData = {
        policyId: policyId,
        ...editingPolicy,
      };
      const res = await requestPost(
        "/attendance/updateWorkPolicy",
        requestData,
      );

      if (res.statusCode === 200) {
        AlertService.success(res.message);
        setMode("view");
        setEditingPolicyId(null);
      } else {
        console.error("API 실패 응답:", res);
        AlertService.error(
          `정책 변경에 실패했습니다: ${res.message || "알 수 없는 오류"}`,
        );
      }
    } catch (error) {
      console.error("handleSaveEdit 에러:", error);
      AlertService.error("정책 변경 중 오류가 발생했습니다.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, menuId: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(menuId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    setMode("view");
    setEditingPolicyId(null);
    // 원래 데이터로 되돌리기 위해 다시 fetch
    getWorkPolicies();
  };

  const handleSelectAll = () => {
    if (!workPolicies) return;

    const allIds = workPolicies
      .map((policy) => policy.policyId || "")
      .filter((id) => id);
    const newSelected =
      selectedPolicies.size === allIds.length
        ? new Set<string>()
        : new Set(allIds);

    setSelectedPolicies(newSelected);
  };

  const onCheck = (policyId: string) => {
    setSelectedPolicies((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(policyId)) {
        newSelected.delete(policyId);
      } else {
        newSelected.add(policyId);
      }
      return newSelected;
    });
  };

  const onClickBulkDelete = async () => {
    if (selectedPolicies.size === 0) {
      AlertService.error("선택된 정책이 없습니다.");
      return;
    }

    const executeDeletion = async () => {
      try {
        const requestData = {
          policyIds: Array.from(selectedPolicies),
        };

        const res = await requestPost(
          "/attendance/deleteBulkWorkPolicy",
          requestData,
        );

        if (res.statusCode === 200) {
          AlertService.success(
            `${selectedPolicies.size}개의 정책이 삭제되었습니다.`,
          );
          getWorkPolicies();
          setSelectedPolicies(new Set());
        } else {
          AlertService.error("정책 삭제에 실패했습니다.");
          console.error("삭제 실패:", res);
        }
      } catch (error) {
        console.error("삭제 API 호출 오류:", error);
        AlertService.error("정책 삭제 중 오류가 발생했습니다.");
      }
    };

    AlertService.warn(
      `선택된 ${selectedPolicies.size}개의 정책을 삭제하시겠습니까?`,
      {
        useConfirmBtn: true,
        useCancelBtn: true,
        onConfirm: () => executeDeletion(),
        onCancel: () => {
          return;
        },
      },
    );
  };

  // 매핑 업데이트 핸들러
  const handleMappingUpdate = (policyId: string, groupName: string) => {
    // 전체 데이터 새로고침 (더 정확한 데이터 동기화)
    getWorkPolicies();
  };

  const isAllSelected =
    workPolicies &&
    workPolicies.length > 0 &&
    selectedPolicies.size === workPolicies.length;

  return (
    <div className={styles.listWrapper}>
      <div className={styles.mailListContainer}>
        <div className={styles.mailListHeader}>
          <div className={clsx(styles.row, styles.gap1rem)}>
            <div className={styles.inRowGroup}>
              <ButtonBasic
                componentType="grayBorder"
                width="4rem"
                disabled={selectedPolicies.size === 0}
                onClick={onClickBulkDelete}
              >
                삭제
              </ButtonBasic>
            </div>
          </div>
        </div>

        <ListHeader
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected || false}
        />
        {workPolicies && workPolicies.length > 0 ? (
          workPolicies.map((wp: WorkPolicyType, index: number) => {
            return (
              <PolicyListLine
                key={wp.policyId}
                onClickEdit={() => onClickEdit(wp.policyId || "")}
                policy={wp}
                mode={mode}
                setMode={setMode}
                isEditingThisPolicy={editingPolicyId === wp.policyId}
                isSelected={selectedPolicies.has(wp.policyId || "")}
                onCheck={() => onCheck(wp.policyId || "")}
                onChangeEditingPolicy={(e: React.ChangeEvent<any>) =>
                  onChangeEditingPolicy(e, wp.policyId || "")
                }
                handleKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e, wp.policyId || "")
                }
                handleSaveEdit={() => handleSaveEdit(wp.policyId || "")}
                onMappingUpdate={handleMappingUpdate}
              />
            );
          })
        ) : (
          <div className={styles.noContact}>연락처가 없습니다.</div>
        )}
        <Divider type="none" />
        <IconNode
          onClick={addPolicy}
          iconName="circlePlus"
          size={26}
          color="gray4"
        />
      </div>
    </div>
  );
}
