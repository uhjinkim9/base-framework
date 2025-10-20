"use client";
import styles from "./styles/AddContact.module.scss";
import {usePathname, useRouter} from "next/navigation";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {PersonalContactType} from "@/types/mail.type";
import {requestPost} from "@/util/api/api-service";
import {getLastUrl} from "@/util/common/last-url";
import {validateContact} from "./etc/validate";
import {useMailContext} from "@/context/MailContext";
import {SelectOptionType} from "@/types/common.type";
import {isEmpty} from "@/util/validators/check-empty";

import InputBasic from "@/components/common/form-properties/InputBasic";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import SelectBoxBasic from "@/components/common/form-properties/SelectBoxBasic";
import SubTitle from "@/components/common/segment/SubTitle";
import Divider from "@/components/common/segment/Divider";
import AlertService from "@/services/alert.service";

export default function AddContact({}: {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [_, mainMenu, subMenu, leafMenu, contactId] = pathname.split("/");
  const lastUrl = getLastUrl() || "/mail/mail-list";

  const {mailMenus} = useMailContext();
  const privateMenus: SelectOptionType[] = useMemo(() => {
    return (
      mailMenus?.private?.map((menu) => ({
        label: menu.menuNm,
        value: menu.menuId,
        idx: menu.menuIdx,
      })) || []
    );
  }, [mailMenus]);

  const [contact, setContact] = useState<PersonalContactType | null>(null);

  useEffect(() => {
    getPersonalContact();
  }, [contactId]);

  const getPersonalContact = async () => {
    if (isEmpty(contactId)) {
      AlertService.error("편집할 연락처를 불러오는 데 실패했습니다.");
    }
    const res = await requestPost("/mail/getPersonalContact");
    if (res.statusCode === 200) {
      setContact(res.data);
    }
  };

  const addContact = async () => {
    const validationCheck = validateContact(contact || {korNm: ""});
    if (!validationCheck) return;

    const res = await requestPost("/mail/upsertPersonalContact", contact);
    if (res.statusCode === 200) {
      setContact(res.data);
      AlertService.success(res.message);
      router.push(lastUrl);
    }
  };

  const cancelAddContact = () => {
    router.push(lastUrl);
    setContact(null);
  };

  const onChangeContact = (e: ChangeEvent<any>) => {
    const {name, value} = e.target;
    setContact((p) => ({
      ...p,
      [name]: value,
    }));
  };

  return (
    <>
      <div className={styles.form}>
        <SubTitle>연락처 등록</SubTitle>
        <Divider type="none" />

        <div className={styles.row}>
          <SelectBoxBasic
            label="폴더"
            name="folderId"
            value={contact?.folderId}
            customOptions={privateMenus}
            onChange={onChangeContact}
          />
        </div>

        <div className={styles.row}>
          <InputBasic
            label="이름"
            name="korNm"
            value={contact?.korNm}
            onChange={onChangeContact}
          />
        </div>

        <div className={styles.row}>
          <InputBasic
            label="이메일"
            name="email"
            value={contact?.email}
            onChange={onChangeContact}
          />
        </div>

        <div className={styles.row}>
          <InputBasic
            label="휴대전화"
            name="mobile"
            value={contact?.mobile}
            onChange={onChangeContact}
          />
        </div>

        <div className={styles.row}>
          <InputBasic
            label="집/직장 전화"
            name="homeTel"
            value={contact?.homeTel}
            onChange={onChangeContact}
          />
        </div>

        <div className={styles.row}>
          <InputBasic
            label="팩스"
            name="fax"
            value={contact?.fax}
            onChange={onChangeContact}
          />
        </div>

        <div className={styles.row}>
          <InputBasic
            label="소속(회사)"
            name="companyNm"
            value={contact?.companyNm}
            onChange={onChangeContact}
          />
        </div>

        <div className={styles.row}>
          <InputBasic
            label="부서"
            name="deptNm"
            value={contact?.deptNm}
            onChange={onChangeContact}
          />
        </div>

        <div className={styles.row}>
          <InputBasic
            label="직급"
            name="posNm"
            value={contact?.posNm}
            onChange={onChangeContact}
          />
        </div>

        <div className={styles.row}>
          <InputBasic
            label="주소"
            name="address"
            value={contact?.address}
            onChange={onChangeContact}
          />
        </div>
        {/* 
        <div className={styles.row}>
          <InputBasic
            label="생년월일"
            name="birthDate"
            value={contact?.birthDate}
            onChange={onChangeContact}
          />
        </div> */}

        <div className={styles.row}>
          <InputBasic
            label="메모"
            name="memo"
            value={contact?.memo}
            onChange={onChangeContact}
          />
        </div>

        <CommonButtonGroup
          usedButtons={{
            btnList: true,
            btnCancel: true,
            btnSubmit: true,
          }}
          onCancel={cancelAddContact}
          onSubmit={addContact}
          listUrl={lastUrl}
        ></CommonButtonGroup>
      </div>

      {/* <Dialog
        dialogConfig={dialogConfig}
        dialogTitle={`${proofFinishTypeMap[approvalOrRejection]} 확인`}
        closeDialog={closeDialog}
        confirmDialog={
          approvalOrRejection === DocStatusEnum.SUBMITTED ? onSubmit : onCancel
        }
        confirmText="확인"
        cancelText="취소"
        width="30rem"
        height="auto"
      >
        {`${proofFinishTypeMap[approvalOrRejection]}하시겠습니까?`}
      </Dialog> */}
    </>
  );
}
