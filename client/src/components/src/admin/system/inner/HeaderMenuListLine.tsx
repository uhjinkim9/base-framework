"use client";
import clsx from "clsx";
import styles from "../styles/ManageHeaderMenu.module.scss";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import InputBasic from "@/components/common/form-properties/InputBasic";
import CheckBox from "@/components/common/form-properties/CheckBox";

import {ModeType} from "@/types/common.type";
import {MenuType} from "@/types/menu.type";

export default function HeaderMenuListLine({
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
  data: MenuType;
  isSelected?: boolean;
  onClickEdit?: () => void;
  onCheck?: () => void;
  mode?: ModeType;
  setMode?: (mode: ModeType) => void;
  isEditingThis?: boolean;
  onChangeEditing?: (e: React.ChangeEvent<any>) => void;
  handleKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement>,
    menuIdx: number,
  ) => void;
  handleSaveEdit?: () => void;
}) {
  const isEditing = mode === "edit" && isEditingThis;
  const isChangeable = data.idx ? data.isChangeable : false; // 신규 생성인 경우 변경 가능

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

        <div className={styles.menuId}>
          {isEditing && isChangeable ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="text"
                name="menuId"
                value={data?.menuId || ""}
                onChange={onChangeEditing}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown?.(e, data.idx ?? 0)
                }
                autoFocus={true}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{data.menuId}</span>
          )}
        </div>

        <div className={styles.menuNm}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="text"
                name="menuNm"
                value={data?.menuNm || ""}
                onChange={onChangeEditing}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown?.(e, data.idx ?? 0)
                }
                autoFocus={true}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{data.menuNm}</span>
          )}
        </div>

        {data?.upperNode && (
          <div className={styles.upperNode}>
            {isEditing ? (
              <div onClick={(e) => e.preventDefault()}>
                <InputBasic
                  type="text"
                  name="upperNode"
                  value={data?.upperNode || ""}
                  onChange={onChangeEditing}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown?.(e, data.idx ?? 0)
                  }
                  autoFocus={true}
                  noPadding={true}
                  width="100%"
                />
              </div>
            ) : (
              <span>{data.upperNode}</span>
            )}
          </div>
        )}

        <div className={styles.isUsed}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="text"
                name="isUsed"
                value={data?.isUsed || ""}
                onChange={onChangeEditing}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown?.(e, data.idx ?? 0)
                }
                autoFocus={true}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{data.isUsed ? "ㅇㅇ" : "ㄴㄴ"}</span>
          )}
        </div>

        <div className={styles.seqNum}>
          {isEditing ? (
            <div onClick={(e) => e.preventDefault()}>
              <InputBasic
                type="text"
                name="seqNum"
                value={data?.seqNum || ""}
                onChange={onChangeEditing}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown?.(e, data.idx ?? 0)
                }
                autoFocus={true}
                noPadding={true}
                width="100%"
              />
            </div>
          ) : (
            <span>{data.seqNum}</span>
          )}
        </div>

        <div className={styles.editBtn}>
          <ButtonBasic onClick={isEditing ? handleSaveEdit : onClickEdit}>
            {isEditing ? "저장" : "수정"}
          </ButtonBasic>
        </div>
      </div>
    </>
  );
}
