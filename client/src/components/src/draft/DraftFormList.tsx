"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import Button from "@/components/common/form-properties/Button";
import styles from "./styles/DraftFormList.module.scss";
import Card from "@/components/common/layout/Card";
import SpaceInCard from "@/components/common/layout/SpaceInCard";
import { GoChecklist } from "react-icons/go";
import { TbReportSearch } from "react-icons/tb";
import StatusItem from "@/components/common/segment/StatusItem";
import CountingItem from "@/components/common/segment/CountingItem";
import ContentCard from "@/components/common/layout/ContentCard";
import { DraftFormType } from "@/types/draft.type";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import Grid from "@/components/common/data-display/Grid";
import { ColumnDef } from "@tanstack/react-table";
import { requestPost } from "@/util/api/api-service";
import { useEffect, useState } from "react";
import ListContentCard from "../poll/ListContentCard";
import DraftFormCard from "./DraftFormCard";
import InputSearch from "@/components/common/form-properties/InputSearch";
import SelectBox from "@/components/common/form-properties/SelectBox";

export default function DraftFormList() {
  const router = useRouter();

  const [searchFormNm, setSearchFormNm] = useState("");
  const [searchFormGroup, setSearchFormGroup] = useState("");

  const handleRowClick = (draftFormId: string) => {
    // 결재문서 작성 페이지로 이동
    router.push(`/draft/write/draftWriter/${draftFormId}`);
  };

  async function getDraftFormList() {
    const param = {
      draftFormNm: searchFormNm,
      draftFGroup: searchFormGroup,
    };
    const res = await requestPost("/draft/getDraftFormList", param);
    if (res.statusCode === 200) {
      setDraftForms(res.data);
    }
  }
  const onClickSearch = async () => {
    await getDraftFormList();
  };

  const [draftForms, setDraftForms] = useState<DraftFormType[]>([]);
  useEffect(() => {
    getDraftFormList();
  }, []);

  return (
    <ContentCard>
      <div style={{ display: "flex" }}>
        <SelectBox
          name="formGroup"
          value=""
          componentType="smallGray"
          customOptions={[
            { value: "", label: "" },
            { value: "기타", label: "기타" },
            { value: "설문조사", label: "설문조사" },
          ]}
          defaultLabel={""}
          onChange={(e: any) => setSearchFormGroup(e.target.value)}
        />

        <InputSearch
          name="search"
          componentType="inList"
          onChange={(e: any) => setSearchFormNm(e.target.value)}
          onClickSearch={onClickSearch}
        />
      </div>
      <div className={styles["mt-50px"]}>
        {draftForms.length !== 0 &&
          draftForms.map((form) => (
            <DraftFormCard
              key={form.draftFormId}
              id={form.draftFormId}
              group={form.formGroup}
              title={form.draftFormNm}
              memo={form.memo}
              onClick={() => handleRowClick(form.draftFormId)}
            />
          ))}
      </div>
    </ContentCard>
  );
}
