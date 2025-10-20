"use client";
import styles from "../styles/MailSetting.module.scss";
import clsx from "clsx";

import Button from "@/components/common/form-properties/Button";
import Grid from "@/components/common/data-display/Grid";
import {GridButton} from "@/components/common/data-display/GridCustomColumn";

export default function SettingFolder({mailIdx}: {mailIdx?: number}) {
	const onClickClear = (rowIndex: number, rowData: any) => {
		alert(`${rowData.folder} 메일함 비우기 클릭`);
	};

	const data = [
		{
			sort: "기본",
			folder: "받은 메일",
			usage: "2,048MB",
			count: 2048,
		},
		{
			sort: "기본",
			folder: "보낸 메일",
			usage: "1,024MB",
			count: 1024,
		},
		{
			sort: "기본",
			folder: "임시 보관",
			usage: "512MB",
			count: 512,
		},
		{
			sort: "기본",
			folder: "스팸 메일",
			usage: "256MB",
			count: 256,
		},
		{
			sort: "기본",
			folder: "휴지통",
			usage: "128MB",
			count: 128,
		},
	];

	const columns = [
		{
			header: "분류",
			accessorKey: "sort",
		},
		{
			header: "메일함",
			accessorKey: "folder",
		},
		{
			header: "용량",
			accessorKey: "usage",
		},
		{
			header: "메일 수",
			accessorKey: "count",
		},
		GridButton("비우기", "비우기", onClickClear),
		GridButton("백업", "백업", onClickClear),
		GridButton("가져오기", "할까?", onClickClear),
	];

	return (
		<>
			<div className={clsx(styles.row, styles.gap1rem)}>
				<Button componentType="smallGray" width="6rem">
					메일함 추가
				</Button>
				<Button componentType="smallGray" width="6rem">
					메일함 백업
				</Button>
			</div>
			<div className={clsx(styles.row, styles.gap1rem)}>
				<Grid data={data} columns={columns} />
			</div>
		</>
	);
}
