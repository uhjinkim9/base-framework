"use client";
import {usePlanContext} from "@/context/PlanContext";
import styles from "../styles/PlanModal.module.scss";

import InputBasic from "@/components/common/form-properties/InputBasic";
import DateTimeRangePicker from "@/components/common/form-properties/DateTimeRangePicker";

export default function AddNewDayOff({
	onChangeNewPlan,
}: {
	onChangeNewPlan: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => void;
}) {
	const {planState, dayoffDispatch} = usePlanContext();
	const {plan} = planState;

	function onChangeDayoff(
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) {
		const {name, value} = e.target;
		console.log(name, value);
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.row}>
				<InputBasic
					label="제목"
					onChange={onChangeNewPlan}
					value={plan?.title}
					name="title"
				/>
			</div>

			<div className={styles.row}>
				<span className={styles.label}>날짜</span>
				<DateTimeRangePicker
					startedAt={plan.startedAt || ""}
					endedAt={plan.endedAt || ""}
					onChange={onChangeNewPlan}
					isDateOnly
				></DateTimeRangePicker>
			</div>

			<div className={styles.row}>
				<span className={styles.refText}>연차 0.5일 단위로 입력</span>
				<span className={styles.refText}>TODO: 전자결재 후</span>
			</div>
		</div>
	);
}
