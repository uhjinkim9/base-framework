"use client";
import styles from "../styles/MailSetting.module.scss";
import clsx from "clsx";

import Toggle from "@/components/common/form-properties/Toggle";
import Divider from "@/components/common/segment/Divider";
import Button from "@/components/common/form-properties/Button";
import TextEditor from "@/components/common/editor/TextEditor";
import Grid from "@/components/common/data-display/Grid";
import {
	GridButton,
	GridIndex,
	GridRadio,
} from "@/components/common/data-display/GridCustomColumn";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";

export default function SettingAutograph({mailIdx}: {mailIdx?: number}) {
	const onClickEdit = (rowIndex: number, rowData: any) => {
		alert(`${rowData.autographNm} 서명 편집 클릭`);
	};
	const onChangeSelection = (rowIndex: number, rowData: any) => {
		alert(`${rowIndex}. ${rowData.autographNm} 서명 선택`);
	};

	const data = [
		{
			autographNm: "기본",
		},
		{
			autographNm: "기본",
		},
		{
			autographNm: "기본",
		},
		{
			autographNm: "기본",
		},
		{
			autographNm: "기본",
		},
	];

	const columns = [
		GridIndex(),
		GridRadio("선택", "selected", onChangeSelection, {
			radioGroupName: "autograph",
			checkValue: "selected", // 선택된 값은 서명의 index여야 함
			componentType: "orange",
		}),
		{
			header: "서명 이름",
			accessorKey: "autographNm",
		},
		GridButton("편집", "편집", onClickEdit),
	];

	const onSubmit = () => {
		alert("서명 설정 저장");
	};

	return (
		<>
			<div className={clsx(styles.row, styles.gap1rem)}>
				<span className={styles.label}>서명 사용</span>
				<Toggle />
			</div>
			<Divider type="middle" />
			<div className={clsx(styles.column, styles.gap1rem)}>
				<Button componentType="smallGray" width="5rem">
					서명 추가
				</Button>
				<Grid data={data} columns={columns} />
				<TextEditor name="mailAutograph" />
				<CommonButtonGroup
					usedButtons={{
						btnSubmit: true,
					}}
					onSubmit={onSubmit}
					submitBtnLabel="저장"
				/>
			</div>
		</>
	);
}
