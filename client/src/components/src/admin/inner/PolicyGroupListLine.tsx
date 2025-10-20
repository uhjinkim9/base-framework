"use client";
import styles from "../styles/AdminAttendanceUser.module.scss";
import clsx from "clsx";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import InputBasic from "@/components/common/form-properties/InputBasic";

import {EmpPolicyGroupType} from "@/types/attendance.type";
import {ModeType} from "@/types/common.type";
import CheckBox from "@/components/common/form-properties/CheckBox";

export default function PolicyGroupListLine({
  data,
  isSelected = false,
  onClickEdit,
  onCheck,
  mode,
  isEditingThis = false,
  onChangeEditing,
  handleKeyDown,
  handleSaveEdit,
}: {
  data: EmpPolicyGroupType;
  isSelected?: boolean;
  onClickEdit?: () => void;
  onCheck?: () => void;
  mode?: ModeType;
  setMode?: (mode: ModeType) => void;
  isEditingThis?: boolean;
  onChangeEditing?: (e: React.ChangeEvent<any>) => void;
  handleKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement>,
    groupIdx: number,
  ) => void;
  handleSaveEdit?: () => void;
}) {
  const isEditing = mode === "edit" && isEditingThis;

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
        <div className={styles.groupNm}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="text"
                name="groupNm"
                value={data?.groupNm || ""}
                onChange={onChangeEditing}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown?.(e, data.groupIdx ?? 0)
                }
                autoFocus={true}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{data.groupNm}</span>
          )}
        </div>

        <div className={styles.editBtn}>
          <ButtonBasic onClick={isEditing ? handleSaveEdit : onClickEdit}>
            {isEditing ? "저장" : "수정"}
          </ButtonBasic>
        </div>

        <div className={styles.mapping}>
          <span>
            {data.policyMappings && data.policyMappings.length > 0
              ? data.policyMappings[0].workPolicy?.policyNm
              : "할당 전"}
          </span>
        </div>
      </div>
    </>
  );
}
