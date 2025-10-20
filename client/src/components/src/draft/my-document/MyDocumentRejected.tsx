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
import InputSearch from "@/components/common/form-properties/InputSearch";
import SelectBox from "@/components/common/form-properties/SelectBox";

export default function MyDocumentRejected() {
  const router = useRouter();

  return (
    <ContentCard>
      <div>반려 문서입니다.</div>
    </ContentCard>
  );
}
