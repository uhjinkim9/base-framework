"use client";
import styles from "../styles/PolicyGroupMapping.module.scss";
import {useEffect, useState} from "react";

import {requestPost} from "@/util/api/api-service";
import {EmpPolicyGroupType, WorkPolicyType} from "@/types/attendance.type";

import clsx from "clsx";
import AlertService from "@/services/alert.service";
import CheckBox from "@/components/common/form-properties/CheckBox";

const ListHeader = ({}: {}) => (
  <div className={clsx(styles.lineWrapper, styles.headerRow)}>
    <div className={styles.groupNm}>그룹명</div>
    <div className={styles.mapping}>선택</div>
  </div>
);

export default function PolicyGroupMapping({
  policy,
  onMappingSuccess,
  onCloseModal,
}: {
  policy?: WorkPolicyType;
  onMappingSuccess?: (groupIdx: number, groupName: string) => void;
  onCloseModal?: () => void;
}) {
  const [workPolicies, setWorkPolicyGroups] = useState<
    EmpPolicyGroupType[] | null
  >(null);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number | null>(null);

  const showMappedGroup = async () => {
    try {
      const param = {};
      const res = await requestPost("/attendance/getPolicyGroups", param);
      if (res.statusCode === 200) {
        console.log("응답 성공 데이터:", res.data);
        setWorkPolicyGroups(res.data);

        // policyMappings relation 데이터를 활용해서 현재 매핑 상태 확인
        if (policy && res.data) {
          const currentMappedGroup = res.data.find((group: any) =>
            group.policyMappings?.some(
              (mapping: any) => mapping.policyId === policy.policyId,
            ),
          );

          if (currentMappedGroup) {
            setSelectedGroupIdx(currentMappedGroup.groupIdx);
          } else {
            setSelectedGroupIdx(null);
          }
        }
      } else {
        AlertService.error(
          `showMappedGroup 실패했습니다: ${res.message || "알 수 없는 오류"}`,
        );
      }
    } catch (error) {
      console.error("showMappedGroup 에러:", error);
      AlertService.error("그룹 조회 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    showMappedGroup();
  }, [policy?.policyId]);

  const onCheckMapping = async (groupIdx: number) => {
    try {
      const param = {
        groupIdx,
        policyId: policy?.policyId,
      };
      const res = await requestPost(
        "/attendance/insertPolicyGroupMapping",
        param,
      );
      if (res.statusCode === 200) {
        const isDeleted = res.data?.deleted === true;

        if (isDeleted) {
          // 매핑 해제된 경우
          setSelectedGroupIdx(null);
          if (onMappingSuccess) {
            onMappingSuccess(0, "할당 전"); // 0과 "할당 전"으로 해제 상태 전달
          }
          AlertService.success("그룹 매핑이 해제되었습니다.");
        } else {
          // 매핑 생성된 경우
          setSelectedGroupIdx(groupIdx);
          const selectedGroup = workPolicies?.find(
            (group) => group.groupIdx === groupIdx,
          );
          if (selectedGroup && onMappingSuccess) {
            onMappingSuccess(groupIdx, selectedGroup.groupNm || "");
          }
          AlertService.success("그룹이 성공적으로 매핑되었습니다.");
        }

        // UI 즉시 반영을 위해 그룹 데이터 다시 불러오기
        await showMappedGroup();

        console.log("응답 성공 데이터:", res.data);
      } else {
        AlertService.error(
          `매핑 생성에 실패했습니다: ${res.message || "알 수 없는 오류"}`,
        );
      }
    } catch (error) {
      console.error("onCheckMapping 에러:", error);
      AlertService.error("매핑 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.listWrapper}>
      <div className={styles.mailListContainer}>
        <ListHeader />
        {workPolicies && workPolicies.length > 0 ? (
          workPolicies.map((pg: EmpPolicyGroupType, index: number) => {
            return (
              <div className={clsx(styles.lineWrapper)} key={index}>
                <div className={styles.groupNm}>
                  <span>{pg.groupNm}</span>
                </div>

                <div className={styles.mapping}>
                  <CheckBox
                    componentType="orange"
                    name="mapping"
                    checkValue={pg.groupIdx}
                    value={pg.groupIdx === pg.policyMappings?.[0]?.groupIdx} // 그룹 입장에서 현재 매핑된 정책 배열은 원소가 무조건 1개
                    onChange={() => onCheckMapping(pg.groupIdx || 0)}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.noContact}>그룹이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
