"use client";
import styles from "../styles/Toolbar.module.scss";
import React from "react";
import clsx from "clsx";
import {
	LuTextCursorInput,
	LuArrowDownFromLine,
	LuCircleCheck,
	LuCircleDot,
	LuCalendar,
	LuPersonStanding,
} from "react-icons/lu";
import {generateNanoId} from "@/util/helpers/random-generator";

import Tooltip from "../../segment/Tooltip";
import SelectBoxBasic from "../../form-properties/SelectBoxBasic";

type Props = {
	editor?: any;
	setLastInsertedId?: (id: string | null) => void;
};

export default function DataElement({editor, setLastInsertedId}: Props) {
	const onClickInputType = (
		type: string,
		isDataEl?: boolean,
		value?: string
	) => {
		let id: string;
		let elType: string;
		// 데이터 엘리먼트는 id 없이 type만 사용하거나, type을 id로 사용
		if (isDataEl) {
			// ## 요소들도 고유한 ID를 가지도록 처리
			if (!value || value.trim() === "") {
				id = `${type}-${generateNanoId(4)}`;
				elType = type;
			} else {
				id = `${value}-${generateNanoId(4)}`;
				elType = value;
			}
		} else {
			id = `${type}-${generateNanoId(4)}`;
			elType = type;
		}

		editor
			.chain()
			.focus()
			.insertContent({
				type: "renderElement",
				attrs: {
					elementType: elType,
					props: {"data-id": id},
				},
			})
			.run();

		setLastInsertedId?.(id);
	};

	return (
		<>
			<div className={clsx(styles.row, styles.smallGap)}>
				<Tooltip text="삽입할 요소 유형 - 직접입력">
					<button onClick={() => onClickInputType("input")}>
						<LuTextCursorInput />
					</button>
				</Tooltip>
				<Tooltip text="삽입할 요소 유형 - 선택창">
					<button onClick={() => onClickInputType("select")}>
						<LuArrowDownFromLine />
					</button>
				</Tooltip>
				<Tooltip text="삽입할 요소 유형 - 체크박스">
					<button onClick={() => onClickInputType("check")}>
						<LuCircleCheck />
					</button>
				</Tooltip>
				<Tooltip text="삽입할 요소 유형 - 라디오">
					<button onClick={() => onClickInputType("radio")}>
						<LuCircleDot />
					</button>
				</Tooltip>
				<Tooltip text="삽입할 요소 유형 - 날짜">
					<button onClick={() => onClickInputType("date")}>
						<LuCalendar />
					</button>
				</Tooltip>
				<Tooltip text="삽입할 요소 유형 - 직원">
					<button onClick={() => onClickInputType("emp")}>
						<LuPersonStanding />
					</button>
				</Tooltip>

				<Tooltip text="데이터 엘리먼트 선택">
					<SelectBoxBasic
						name="dataField"
						defaultLabel="선택"
						onChange={(e) => {
							onClickInputType("span", true, e.target.value);
						}}
						codeClass="data-element"
					></SelectBoxBasic>
				</Tooltip>
			</div>
		</>
	);
}
