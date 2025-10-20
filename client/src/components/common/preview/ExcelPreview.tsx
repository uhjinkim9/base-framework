"use client";

import {useEffect, useState} from "react";
import * as XLSX from "xlsx";
import styles from "./ExcelPreview.module.scss";
import {requestGetBlob} from "@/util/api/api-service";

type ExcelPreviewProps = {
	fileName: string;
};

export default function ExcelPreview({fileName}: ExcelPreviewProps) {
	const [data, setData] = useState<string[][]>([]);

	const fetchExcel = async () => {
		const blob = await requestGetBlob(`/board/preview/${fileName}`);
		const arrayBuffer = await blob.arrayBuffer();
		const workbook = XLSX.read(arrayBuffer, {type: "array"});
		const sheetName = workbook.SheetNames[0];
		const sheet = workbook.Sheets[sheetName];
		const parsedData: string[][] = XLSX.utils.sheet_to_json(sheet, {
			header: 1,
			blankrows: false,
		});
		setData(parsedData);
	};

	useEffect(() => {
		fetchExcel();
	}, [fileName]);

	return (
		<div className={styles.excelPreview}>
			<table>
				<tbody>
					{data.map((row, rowIndex) => (
						<tr key={rowIndex}>
							{row.map((cell, colIndex) => (
								<td key={colIndex}>{cell}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
