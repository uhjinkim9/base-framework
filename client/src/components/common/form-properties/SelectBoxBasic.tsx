"use client";
import styles from "./styles/SelectBoxBasic.module.scss";
import {ChangeEvent, useState, useEffect} from "react";

import {requestPost} from "@/util/api/api-service";
import {isEmpty, isNotEmpty} from "@/util/validators/check-empty";
import clsx from "clsx";

type Props = {
  label?: string;
  name?: string;
  value?: any;
  defaultLabel?: string;
  customOptions?: {label: string; value: any}[];
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  codeClass?: string;
  width?: string;
  readonly?: boolean;
  noPadding?: boolean;
};

const SelectBoxBasic = ({
  label = "",
  name,
  value,
  defaultLabel = "선택",
  customOptions,
  onChange,
  codeClass,
  width,
  readonly = false,
  noPadding = false,
}: Props) => {
  const [settingCodes, setSettingCodes] = useState<
    {label: string; value: string}[]
  >([]);

  useEffect(() => {
    if (isEmpty(customOptions) && codeClass) {
      getSettingCodes();
    }
  }, [customOptions, codeClass]);

  async function getSettingCodes() {
    const codeGroup = await requestPost("/menu/getSettingCode", {
      codeClass: codeClass,
    });
    const {detail} = codeGroup[0];
    const options = detail.map((item: any) => ({
      label: item.codeNm,
      value: item.code,
    }));

    setSettingCodes(options);
  }

  function onChangeSelect(e: ChangeEvent<HTMLSelectElement>) {
    onChange?.(e);
  }

  const optionsToRender = customOptions ?? settingCodes;

  return (
    <div
      className={clsx(styles.container, noPadding ? styles.noPadding : "")}
      style={{width}}
    >
      {isNotEmpty(label) && <label className={styles.label}>{label}</label>}
      <select
        name={name}
        className={styles.selectBox}
        onChange={onChangeSelect}
        value={value ?? ""}
        disabled={readonly}
        style={{width}}
      >
        <option value="" className={styles.refText}>
          {defaultLabel}
        </option>
        {optionsToRender.map((option, index) => (
          <option key={index} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectBoxBasic;
