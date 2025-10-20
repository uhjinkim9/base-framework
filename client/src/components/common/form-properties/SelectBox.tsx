"use client";
import styles from "./styles/SelectBox.module.scss";
import {ChangeEvent, useState, useEffect} from "react";

import {requestPost} from "@/util/api/api-service";
import {GoTriangleDown} from "react-icons/go";
import {isEmpty} from "@/util/validators/check-empty";

/**
 * @fileoverview SelectBox 컴포넌트
 * @description 사용자에게 선택 옵션을 제공하는 드롭다운 컴포넌트. 커스텀 옵션 또는 API로 받아온 설정 코드 목록을 기반으로 옵션을 표시.
 *
 * @interface SelectBoxProps
 * @property {Array<{label: string; value: string}>} [customOptions] - 커스텀 옵션 목록 (선택 사항)
 * @property {"orangeBorderBlackLetter" | "secondary" | "smallGray"} [componentType] - 드롭다운의 스타일 타입 (기본값: "primary")
 * @property {string} [codeClass] - API에서 설정 코드 가져올 때 사용하는 코드 클래스 (선택 사항)
 *
 * @function handleChange - 선택 값 변경 시 호출되는 이벤트 핸들러
 * @function getSettingCodes - API를 통해 설정 코드 목록을 받아오는 비동기 함수
 *
 * @effect
 * - `customOptions`가 제공되지 않으면 `codeClass`를 사용하여 설정 코드를 API에서 받아옴
 * - 선택된 값이 변경되면 `onChange` 핸들러가 호출되어 부모 컴포넌트에 값을 전달
 *
 * @author 김어진
 */

interface SelectBoxProps {
	componentType?: "orangeBorderBlackLetter" | "secondary" | "smallGray";
	name: string;
	value: any;
	defaultLabel?: string;
	customOptions?: {label: string; value: any}[];
	onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
	codeClass?: string;
	width?: string;
	readonly?: boolean;
}

const SelectBox = ({
	name,
	value,
	defaultLabel = "선택",
	customOptions,
	onChange,
	componentType = "orangeBorderBlackLetter",
	codeClass,
	width,
	readonly = false,
}: SelectBoxProps) => {
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
			className={`${styles.selectWrapper} ${styles[componentType]}`}
			style={{width}}
		>
			<select
				name={name}
				className={styles.selectBox}
				onChange={onChangeSelect}
				value={value ?? ""}
				disabled={readonly}
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
			<GoTriangleDown className={styles.icon} />
		</div>
	);
};

export default SelectBox;
