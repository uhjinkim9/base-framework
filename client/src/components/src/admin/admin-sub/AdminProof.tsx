"use client";
import styles from "../styles/Admin.module.scss";
import AlertService from "@/services/alert.service";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import Grid from "@/components/common/data-display/Grid";

import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {ColumnDef} from "@tanstack/react-table";
import {NodeLevelType} from "@/types/menu.type";
import {FormType} from "../../docs/etc/docs.type";
import {getProofFormColumns} from "../etc/grid-columns/proof-form-column";
import {UrlEnum} from "../etc/url.enum";
import {useAdminContext} from "@/context/AdminContext";
import {requestPost} from "@/util/api/api-service";

export default function AdminProof() {
  const [rows, setRows] = useState<FormType[]>();
  const [checkedRowIds, setCheckedRowIds] = useState<Set<string>>(new Set());
  const {setMode, setForm, setFields} = useAdminContext();

  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu] = pathSegs; // mainMenu: community
  const router = useRouter();

  useEffect(() => {
    getProofForms();
  }, []);

  async function getProofForms() {
    const res = await requestPost("/docs/getProofForms");
    if (res.statusCode === 200) {
      setRows(res.data);
    }
  }

  function moveToAddForm() {
    router.push(`/${mainMenu}/${subMenu}/${UrlEnum.ADD}`);
  }

  async function onClickEdit(rowIndex: number, rowData: any) {
    const res = await requestPost("/docs/getProofForm", {
      formId: rowData.formId,
    });
    if (res.statusCode === 200) {
      setMode("edit");
      setForm(res.data.form);
      setFields(res.data.fields);
      router.push(`/${mainMenu}/${subMenu}/${UrlEnum.ADD}`);
    }
  }

  async function deleteMenu() {
    const checkedSize = checkedRowIds.size;

    if (checkedSize === 0) {
      AlertService.warn("삭제할 항목을 선택하세요.");
      return;
    }

    AlertService.warn("선택하신 모든 데이터가 삭제됩니다. 삭제하시겠습니까?", {
      useConfirmBtn: true,
      useCancelBtn: true,
      onConfirm: () => deleteConfirmed(),
      onCancel: () => {},
    });
  }

  async function deleteConfirmed() {
    if (checkedRowIds.size === 0) {
      AlertService.warn("삭제할 항목을 선택하세요.");
      return;
    }

    const idList = Array.from(checkedRowIds);
    const url = "/docs/deleteProofForms";
    try {
      const res = await requestPost(url, {idList});

      if (res.statusCode === 200) {
        AlertService.success("삭제되었습니다.");
        // 선택된 row 삭제
        setRows((prev) => {
          const filteredFirstNodes = prev?.filter(
            (m) => !checkedRowIds?.has(m.formId),
          );
          return filteredFirstNodes || [];
        });
        setCheckedRowIds(new Set()); // 체크 상태 초기화
      } else {
        AlertService.error("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      AlertService.error("삭제 중 오류가 발생했습니다.");
    }
  }

  const handleCheckByType = (rowIdx: any, rowData: any, checked: boolean) => {
    const setKey = rowData.formId;
    if (!setKey) return; // 키가 없으면 처리하지 않음

    setCheckedRowIds((prev) => {
      const checkedSet = new Set(prev);
      checked ? checkedSet.add(setKey) : checkedSet.delete(setKey);
      return checkedSet;
    });
  };

  const firstColumns = getProofFormColumns(
    (rowIdx: number, rowData: any, checked: boolean) =>
      handleCheckByType(rowIdx, rowData, checked),
    checkedRowIds,
    onClickEdit,
  );

  const commonGridStructure = (
    type: NodeLevelType,
    mainText: string,
    grid: {data: any[]; columns: ColumnDef<any>[]},
  ) => (
    <div className={styles.gridHalf}>
      <div className={styles.gridHeader}>
        <div className={styles.mainText}>{mainText}</div>
        <div className={styles.btnGroup}>
          <ButtonBasic onClick={moveToAddForm} onHoverOpaque>
            추가
          </ButtonBasic>
          <ButtonBasic onClick={deleteMenu} onHoverOpaque>
            삭제
          </ButtonBasic>
        </div>
      </div>
      <Grid data={grid.data} columns={grid.columns}></Grid>
    </div>
  );

  return (
    <>
      <div className={styles.gridWrapper}>
        {commonGridStructure("upper", "증명서 양식", {
          data: rows || [],
          columns: firstColumns,
        })}
      </div>
    </>
  );
}
