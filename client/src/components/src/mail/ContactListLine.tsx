"use client";
import styles from "./styles/ContactList.module.scss";
import clsx from "clsx";
import CheckIconBox from "@/components/common/form-properties/CheckIconBox";
import CheckBox from "@/components/common/form-properties/CheckBox";

import {useUserContext} from "@/context/UserContext";
import {ContactType} from "@/types/mail.type";
import {isNotEmpty} from "@/util/validators/check-empty";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";

export default function ContactListLine({
  onClickContact,
  onCheck,
  contact,
  selectionMode = false,
  isSelected = false,
  onContactSelect,
  onClickEdit,
  isCompany,
}: {
  onClickContact?: () => void;
  onCheck?: () => void;
  contact: ContactType;
  selectionMode?: boolean;
  isSelected?: boolean;
  onContactSelect?: () => void;
  onClickEdit?: () => void;
  isCompany?: boolean;
}) {
  const {matchUserIdToRank} = useUserContext();

  return (
    <>
      <div className={clsx(styles.lineWrapper, isSelected && styles.selected)}>
        <div className={styles.check}>
          <CheckBox
            componentType="orange"
            value={selectionMode ? isSelected : false}
            onChange={
              selectionMode
                ? () => {
                    onContactSelect?.();
                  }
                : undefined
            }
          />
        </div>

        <div className={styles.isImportant}>
          <CheckIconBox
            componentType="star"
            onChange={onCheck}
            value={contact.isImportant}
            size={20}
          />
        </div>

        <div className={styles.companyNm}>{contact.companyNm}</div>

        <div className={styles.userId} onClick={onClickContact}>
          {contact.userId}
        </div>

        <div className={styles.korNm} onClick={onClickContact}>
          {isNotEmpty(contact.korNm)
            ? contact.korNm
            : matchUserIdToRank(contact.korNm ?? "")}
        </div>

        <div className={styles.email}>{contact.email}</div>

        <div className={styles.deptNm}>{contact.deptNm}</div>

        <div className={styles.mobile}>{contact.mobile}</div>

        <div className={styles.empNo}>{contact.empNo}</div>

        {isCompany ? null : (
          <div className={styles.editBtn}>
            <ButtonBasic onClick={onClickEdit}>수정</ButtonBasic>
          </div>
        )}
      </div>
    </>
  );
}
